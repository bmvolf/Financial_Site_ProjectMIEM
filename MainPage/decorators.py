import json
from functools import wraps

from django.http import JsonResponse


def require_calculation_data(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        try:
            data = json.loads(request.body)
        except (ValueError, UnicodeDecodeError):
            return JsonResponse(
                {"error": "Некорректный JSON"},
                status=400,
            )

        if not isinstance(data, dict):
            return JsonResponse(
                {"error": "Ожидается JSON-объект"},
                status=400,
            )

        for field in ("methods", "tickers"):
            value = data.get(field)

            if not isinstance(value, list) or not value:
                return JsonResponse(
                    {"error": f"Поле {field} должно быть непустым списком"},
                    status=400,
                )

        if not all(
            isinstance(ticker, str) and ticker.strip()
            for ticker in data["tickers"]
        ):
            return JsonResponse(
                {"error": "Тикеры должны быть непустыми строками"},
                status=400,
            )

        request.calculation_data = data

        return view_func(request, *args, **kwargs)

    return wrapper