import logging
from contextvars import ContextVar


# Set per request (and in worker threads) so every log line can be traced back to a request
request_id_var = ContextVar('request_id', default='-')


class RequestIdFilter(logging.Filter):
    def filter(self, record):
        record.request_id = request_id_var.get()
        return True


def configure_logging(level):
    handler = logging.StreamHandler()
    handler.addFilter(RequestIdFilter())
    handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)-7s [%(request_id)s] %(name)s: %(message)s'
    ))

    root = logging.getLogger()
    root.handlers[:] = [handler]
    root.setLevel(level)

    # Per-HTTP-call logs from these libraries drown out our own
    for noisy in ('httpx', 'httpcore', 'openai', 'urllib3', 'pymongo'):
        logging.getLogger(noisy).setLevel(logging.WARNING)
