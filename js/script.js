export class Main {
    oldNeutralLocations = new Map();
    constructor() {
        for (var i = 0; i < 7; i++) {
            let building = this.addBuilding(i, "neutral-buildings");
        }
        for (var i = 0; i < 12; i++) {
            this.addBuilding(i, "player-buildings");
        }
    }
    shuffle() {
        var container = document.getElementById("player-buildings");
        for (let elem of container.children) {
            if (elem instanceof HTMLDivElement) {
                let elemAny = elem;
                if (elemAny.rotDegrees === undefined) {
                    elemAny.rotDegrees = 0;
                }
                elemAny.rotDegrees += Math.floor((Math.random() * 4) + 5) * 180;
                elem.style.transform = `rotateY(${elemAny.rotDegrees}deg)`;
                // elem.classList.toggle("a-side");
                // elem.classList.toggle("b-side");
            }
        }
        container = document.getElementById("neutral-buildings");
        // Record old building locations, clear animations
        for (let i = 0; i < container.children.length; i++) {
            let building = container.children[i];
            building.style.animation = "none";
            this.oldNeutralLocations.set(building, { top: building.offsetTop, left: building.offsetLeft });
        }
        for (let i = container.children.length; i >= 0; i--) {
            // "| 0" casts to int
            container.appendChild(container.children[Math.random() * i | 0]);
        }
        // Animate neutral buildings
        for (let i = 0; i < container.children.length; i++) {
            let building = container.children[i];
            let oldOffset = this.oldNeutralLocations.get(building);
            building.style.setProperty("--old-pos-x", `${oldOffset.left - building.offsetLeft}px`);
            building.style.setProperty("--old-pos-y", `${oldOffset.top - building.offsetTop}px`);
            building.style.animation = `shuffle 1s ease-in-out`;
        }
    }
    addBuilding(index, type) {
        var a_col;
        var a_row;
        var b_col;
        var b_row;
        if (type == "neutral-buildings") {
            a_col = b_col = index;
            a_row = b_row = 0;
        }
        else if (type == "player-buildings") {
            a_col = (index * 2) % 11;
            a_row = Math.floor((index * 2) / 11) + 1;
            b_col = (index * 2 + 1) % 11;
            b_row = Math.floor((index * 2 + 1) / 11) + 1;
        }
        var container = document.getElementById(type);
        var buildingContainer = document.createElement("div");
        buildingContainer.classList.add("building-container");
        var building_a = document.createElement("div");
        var building_b = document.createElement("div");
        building_a.classList.add("building", "a-side");
        building_b.classList.add("building", "b-side");
        building_a.style.setProperty("--building-row", a_row.toString());
        building_a.style.setProperty("--building-col", a_col.toString());
        building_b.style.setProperty("--building-row", b_row.toString());
        building_b.style.setProperty("--building-col", b_col.toString());
        buildingContainer.appendChild(building_a);
        buildingContainer.appendChild(building_b);
        container.appendChild(buildingContainer);
        if (type == "player-buildings") {
            buildingContainer.style.transition = `transform ${3}s ${index / 8}s`;
        }
        return buildingContainer;
    }
}
