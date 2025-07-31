from flask import Flask

def create_app():
    app = Flask(__name__)

    with app.app_context():
        from .routes import routes
        from .config import Config

        Config()
        app.logger.info("App initialized successfully")

    return app
