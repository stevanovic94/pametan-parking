#!/usr/bin/env python3

from __future__ import annotations

import json
import logging
import os
import statistics
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import adafruit_vl53l0x
import board
import digitalio


HOST = os.getenv("HARDWARE_BRIDGE_HOST", "127.0.0.1")
PORT = int(os.getenv("HARDWARE_BRIDGE_PORT", "8765"))

READ_INTERVAL_S = 0.35
INIT_WAIT_S = 1.0
INIT_RETRIES = 3
ERRORS_TO_UNKNOWN = 3
DEBOUNCE_READINGS = 3
RECOVERY_INTERVAL_S = 5.0
CALIBRATION_SAMPLES = 10

CALIBRATION_FILE = Path(
    os.getenv(
        "PARKING_SENSOR_CALIBRATION_FILE",
        str(Path(__file__).with_name("parking-sensor-calibration.json")),
    )
)

XSHUT_PINS = (
    board.D17,
    board.D27,
    board.D22,
    board.D23,
)

I2C_ADDRESSES = (
    0x30,
    0x31,
    0x32,
    0x33,
)

SEGMENT_PINS = {
    "A": board.D4,
    "B": board.D5,
    "C": board.D6,
    "D": board.D12,
    "E": board.D13,
    "F": board.D16,
    "G": board.D19,
}

DIGITS = {
    0: {"A", "B", "C", "D", "E", "F"},
    1: {"B", "C"},
    2: {"A", "B", "D", "E", "G"},
    3: {"A", "B", "C", "D", "G"},
    4: {"B", "C", "F", "G"},
    5: {"A", "C", "D", "F", "G"},
    6: {"A", "C", "D", "E", "F", "G"},
    7: {"A", "B", "C"},
    8: {"A", "B", "C", "D", "E", "F", "G"},
    9: {"A", "B", "C", "D", "F", "G"},
}


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)

logger = logging.getLogger("parking-hardware-bridge")


class SensorManager:
    def __init__(self) -> None:
        self.i2c = board.I2C()

        self.xshut = [digitalio.DigitalInOut(pin) for pin in XSHUT_PINS]

        for pin in self.xshut:
            pin.switch_to_output(value=False)

        self.sensors = [None, None, None, None]

        self.states = [
            "UNKNOWN",
            "UNKNOWN",
            "UNKNOWN",
            "UNKNOWN",
        ]

        self.distances = [None, None, None, None]
        self.error_counts = [0, 0, 0, 0]

        self.candidates = [None, None, None, None]
        self.candidate_counts = [0, 0, 0, 0]

        self.next_recovery = [0.0, 0.0, 0.0, 0.0]

        self.lock = threading.Lock()
        self.running = True

        self.calibration = self.load_calibration()

        self.initialize_all()

        if not self.calibration:
            if all(sensor is not None for sensor in self.sensors):
                logger.warning(
                    "Kalibracija ne postoji. "
                    "Pretpostavlja se da su sva 4 parking mesta PRAZNA."
                )

                self.calibrate_empty()
            else:
                logger.error(
                    "Kalibracija ne postoji, a nisu dostupna sva 4 senzora. "
                    "Status ostaje UNKNOWN."
                )

        self.thread = threading.Thread(
            target=self.read_loop,
            daemon=True,
        )

        self.thread.start()

    def initialize_all(self) -> None:
        logger.info("Gasim sva 4 VL53L0X senzora.")

        for pin in self.xshut:
            pin.value = False

        time.sleep(INIT_WAIT_S)

        for index in range(4):
            self.initialize_sensor(index)

    def initialize_sensor(self, index: int) -> bool:
        pin = self.xshut[index]
        address = I2C_ADDRESSES[index]

        for attempt in range(1, INIT_RETRIES + 1):
            try:
                pin.value = False
                time.sleep(0.1)

                pin.value = True
                time.sleep(INIT_WAIT_S)

                sensor = adafruit_vl53l0x.VL53L0X(self.i2c)

                sensor.set_address(address)

                self.sensors[index] = sensor
                self.error_counts[index] = 0

                logger.info(
                    "Senzor %d pokrenut na adresi 0x%02X.",
                    index + 1,
                    address,
                )

                return True

            except Exception as exc:
                logger.warning(
                    "Senzor %d init pokušaj %d/%d nije uspeo: %s",
                    index + 1,
                    attempt,
                    INIT_RETRIES,
                    exc,
                )

        self.sensors[index] = None

        self.states[index] = "UNKNOWN"
        self.distances[index] = None

        self.next_recovery[index] = time.monotonic() + RECOVERY_INTERVAL_S

        return False

    def load_calibration(self) -> dict:
        if not CALIBRATION_FILE.exists():
            return {}

        try:
            data = json.loads(CALIBRATION_FILE.read_text(encoding="utf-8"))

            logger.info(
                "Učitana kalibracija iz %s.",
                CALIBRATION_FILE,
            )

            return data

        except Exception as exc:
            logger.error(
                "Kalibracioni fajl nije moguće učitati: %s",
                exc,
            )

            return {}

    def calibrate_empty(self) -> None:
        calibration = {}

        for index, sensor in enumerate(self.sensors):
            if sensor is None:
                return

            samples = []
            attempts = 0

            while (
                len(samples) < CALIBRATION_SAMPLES
                and attempts < CALIBRATION_SAMPLES * 3
            ):
                attempts += 1

                try:
                    distance = int(sensor.range)

                    if distance > 0:
                        samples.append(distance)

                except Exception:
                    pass

                time.sleep(0.05)

            if len(samples) < CALIBRATION_SAMPLES:
                logger.error(
                    "Kalibracija senzora %d nije uspela.",
                    index + 1,
                )

                return

            baseline = int(statistics.median(samples))

            occupied_delta = max(
                40,
                int(baseline * 0.25),
            )

            free_delta = max(
                20,
                int(baseline * 0.12),
            )

            calibration[str(index + 1)] = {
                "baselineMm": baseline,
                "occupiedThresholdMm": baseline - occupied_delta,
                "freeThresholdMm": baseline - free_delta,
            }

            self.states[index] = "FREE"

            logger.info(
                "Senzor %d: baseline=%d mm.",
                index + 1,
                baseline,
            )

        CALIBRATION_FILE.write_text(
            json.dumps(
                calibration,
                indent=2,
            ),
            encoding="utf-8",
        )

        self.calibration = calibration

        logger.info(
            "Kalibracija sačuvana u %s.",
            CALIBRATION_FILE,
        )

    def classify(
        self,
        index: int,
        distance: int,
    ) -> str:
        config = self.calibration.get(str(index + 1))

        if not config:
            return "UNKNOWN"

        occupied_threshold = int(config["occupiedThresholdMm"])

        free_threshold = int(config["freeThresholdMm"])

        current = self.states[index]

        if current == "FREE":
            if distance <= occupied_threshold:
                return "OCCUPIED"

            return "FREE"

        if current == "OCCUPIED":
            if distance >= free_threshold:
                return "FREE"

            return "OCCUPIED"

        if distance <= occupied_threshold:
            return "OCCUPIED"

        if distance >= free_threshold:
            return "FREE"

        return "UNKNOWN"

    def apply_debounce(
        self,
        index: int,
        candidate: str,
    ) -> None:
        current = self.states[index]

        if candidate == current:
            self.candidates[index] = None
            self.candidate_counts[index] = 0
            return

        if self.candidates[index] == candidate:
            self.candidate_counts[index] += 1
        else:
            self.candidates[index] = candidate
            self.candidate_counts[index] = 1

        if self.candidate_counts[index] >= DEBOUNCE_READINGS:
            self.states[index] = candidate
            self.candidates[index] = None
            self.candidate_counts[index] = 0

    def mark_failed(self, index: int) -> None:
        self.states[index] = "UNKNOWN"
        self.distances[index] = None

        self.sensors[index] = None

        try:
            self.xshut[index].value = False
        except Exception:
            pass

        self.next_recovery[index] = time.monotonic() + RECOVERY_INTERVAL_S

    def try_recovery(self, index: int) -> None:
        if time.monotonic() < self.next_recovery[index]:
            return

        logger.info(
            "Pokušaj oporavka senzora %d.",
            index + 1,
        )

        if self.initialize_sensor(index):
            self.states[index] = "UNKNOWN"
            self.candidates[index] = None
            self.candidate_counts[index] = 0
        else:
            self.next_recovery[index] = time.monotonic() + RECOVERY_INTERVAL_S

    def read_loop(self) -> None:
        while self.running:
            for index in range(4):
                sensor = self.sensors[index]

                if sensor is None:
                    self.try_recovery(index)
                    continue

                try:
                    distance = int(sensor.range)

                    self.error_counts[index] = 0
                    self.distances[index] = distance

                    candidate = self.classify(
                        index,
                        distance,
                    )

                    self.apply_debounce(
                        index,
                        candidate,
                    )

                except Exception as exc:
                    self.error_counts[index] += 1

                    logger.warning(
                        "Greška senzora %d (%d/%d): %s",
                        index + 1,
                        self.error_counts[index],
                        ERRORS_TO_UNKNOWN,
                        exc,
                    )

                    if self.error_counts[index] >= ERRORS_TO_UNKNOWN:
                        self.mark_failed(index)

            time.sleep(READ_INTERVAL_S)

    def snapshot(self) -> list[dict]:
        with self.lock:
            return [
                {
                    "position": index + 1,
                    "distanceMm": self.distances[index],
                    "occupancyStatus": self.states[index],
                }
                for index in range(4)
            ]


class DisplayController:
    def __init__(self) -> None:
        self.outputs = {}

        for name, pin in SEGMENT_PINS.items():
            output = digitalio.DigitalInOut(pin)
            output.switch_to_output(value=False)

            self.outputs[name] = output

        self.lock = threading.Lock()

    def show(self, value: int) -> None:
        if value not in DIGITS:
            raise ValueError("Displej podržava samo cifre 0-9.")

        segments = DIGITS[value]

        with self.lock:
            for name, output in self.outputs.items():
                output.value = name in segments


sensor_manager: SensorManager
display_controller: DisplayController


class RequestHandler(BaseHTTPRequestHandler):
    def send_json(
        self,
        status: int,
        payload: dict,
    ) -> None:
        data = json.dumps(payload).encode("utf-8")

        self.send_response(status)

        self.send_header(
            "Content-Type",
            "application/json; charset=utf-8",
        )

        self.send_header(
            "Content-Length",
            str(len(data)),
        )

        self.end_headers()

        self.wfile.write(data)

    def do_GET(self) -> None:
        if self.path == "/health":
            self.send_json(
                200,
                {
                    "status": "ok",
                },
            )

            return

        if self.path == "/sensors":
            self.send_json(
                200,
                {
                    "sensors": sensor_manager.snapshot(),
                },
            )

            return

        self.send_json(
            404,
            {
                "error": "Not found",
            },
        )

    def do_POST(self) -> None:
        if self.path != "/display":
            self.send_json(
                404,
                {
                    "error": "Not found",
                },
            )

            return

        try:
            content_length = int(
                self.headers.get(
                    "Content-Length",
                    "0",
                )
            )

            body = self.rfile.read(content_length)

            payload = json.loads(body.decode("utf-8"))

            free_spaces = int(payload["freeSpaces"])

            display_controller.show(free_spaces)

            self.send_json(
                200,
                {
                    "freeSpaces": free_spaces,
                },
            )

        except Exception as exc:
            self.send_json(
                400,
                {
                    "error": str(exc),
                },
            )

    def log_message(
        self,
        format: str,
        *args,
    ) -> None:
        logger.info(
            "%s - %s",
            self.address_string(),
            format % args,
        )


def main() -> None:
    global sensor_manager
    global display_controller

    sensor_manager = SensorManager()
    display_controller = DisplayController()

    server = ThreadingHTTPServer(
        (HOST, PORT),
        RequestHandler,
    )

    logger.info(
        "Hardware bridge sluša na http://%s:%d",
        HOST,
        PORT,
    )

    server.serve_forever()


if __name__ == "__main__":
    main()
