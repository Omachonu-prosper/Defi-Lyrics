import uuid

from flask import Flask, g
from flask_cors import CORS
from werkzeug.exceptions import InternalServerError

from app.config import Config
from app.logging_config import configure_logging, request_id_var
from app.utils.response import Response


def create_app():
    # Configure logging before Flask so it doesn't attach its own handler
    configure_logging(Config.LOG_LEVEL)

    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app, expose_headers=['X-Request-ID'])

    @app.before_request
    def assign_request_id():
        g.request_id = uuid.uuid4().hex[:8]
        request_id_var.set(g.request_id)

    @app.after_request
    def add_request_id_header(response):
        response.headers['X-Request-ID'] = g.request_id
        return response

    @app.errorhandler(InternalServerError)
    def internal_error(e):
        # Flask has already logged the traceback by this point
        return Response.error_response(
            "Something went wrong on our side.", 500, data={'request_id': g.get('request_id')}
        )

    with app.app_context():
        from app.routes import routes

        app.logger.info("App initialized successfully")

    return app
