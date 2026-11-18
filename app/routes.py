import json
from pathlib import Path
from flask import Blueprint, current_app, jsonify, render_template, request

main = Blueprint("main", __name__)

def load_items():
    project_root = Path(current_app.root_path).parent
    data_path = project_root / "data" / "items.json"
    with data_path.open(encoding="utf-8") as file:
        return json.load(file)

@main.get("/")
def index():
    return render_template("index.html")

@main.get("/api/items")
def api_items():
    items = load_items()
    query = request.args.get("q", "").strip().lower()
    category = request.args.get("category", "All")
    sort = request.args.get("sort", "name")
    min_price = request.args.get("min", "").strip()
    max_price = request.args.get("max", "").strip()

    if query:
        items = [x for x in items if query in x["name"].lower()
                 or query in x["category"].lower()
                 or query in x["subcategory"].lower()]
    if category != "All":
        items = [x for x in items if x["category"] == category]
    if min_price:
        try:
            items = [x for x in items if x["price"] >= float(min_price)]
        except ValueError:
            pass
    if max_price:
        try:
            items = [x for x in items if x["price"] <= float(max_price)]
        except ValueError:
            pass

    if sort == "price-low":
        items.sort(key=lambda x: x["price"])
    elif sort == "price-high":
        items.sort(key=lambda x: x["price"], reverse=True)
    else:
        items.sort(key=lambda x: x["name"].lower())

    return jsonify({
        "items": items,
        "total": len(items),
        "categories": ["All", "Vehicles", "Properties", "Upgrades"]
    })

@main.get("/api/stats")
def api_stats():
    items = load_items()
    return jsonify({
        "total": len(items),
        "vehicles": sum(x["category"] == "Vehicles" for x in items),
        "properties": sum(x["category"] == "Properties" for x in items),
        "upgrades": sum(x["category"] == "Upgrades" for x in items)
    })
