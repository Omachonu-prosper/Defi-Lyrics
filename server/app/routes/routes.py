from flask import current_app as app
from app.utils.response import Response


@app.route('/api/v1/')
def index():
    return Response.success_response("Defi-Lyrics API v1")
