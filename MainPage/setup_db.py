from pathlib import Path
import duckdb


ROOT = Path(__file__).resolve().parent
PARQUET_DIR = ROOT / "database"
DB_PATH = ROOT / "market.duckdb"


def main():
    # Проверяем, что хранилище существует
    if not PARQUET_DIR.is_dir():
        raise FileNotFoundError(PARQUET_DIR)

    if not any(PARQUET_DIR.rglob("*.parquet")):
        raise FileNotFoundError("Parquet-файлы не найдены")

    # Открываем или создаём базу данных
    db = duckdb.connect(str(DB_PATH))

    # Шаблон поиска файлов во всех подпапках
    pattern = (PARQUET_DIR / "**" / "*.parquet").as_posix()

    # Экранируем путь для SQL
    pattern = pattern.replace("'", "''")

    # Создаём представление поверх файлов
    db.execute(f"""
        CREATE OR REPLACE VIEW deals AS
        SELECT *
        FROM read_parquet(
            '{pattern}',
            union_by_name = true,
            filename = true,
            hive_partitioning = false
        )
    """)

    print("База данных:", DB_PATH)
    print("Представление deals создано")

    # Проверяем столбцы
    print(db.execute("DESCRIBE deals").fetchall())

    db.close()


if __name__ == "__main__":
    main()