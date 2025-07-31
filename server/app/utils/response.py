from flask import jsonify
from typing import Any


class Response:
    @staticmethod
    def success_response(
        msg: str,
        status_code: int = 200,
        data: dict[str, Any] | list[Any] | None= None
    ):
        return jsonify({
            "status": status_code,
            "msg": msg,
            "data": data
        }), status_code
    
    @staticmethod
    def error_response(
        msg: str,
        status_code: int = 400,
        data: dict[str, Any] | list[Any] | None= None
    ):
        return jsonify({
            "status": status_code,
            "msg": msg,
            "data": data
        }), status_code
        