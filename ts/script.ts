interface IOffset {
    top: number;
    left: number;
}

export class Main {
    private readonly oldLocations: Map<HTMLDivElement, IOffset> = new Map();

    constructor() {
        for (var i = 0; i < 7; i++)
        {
            let building = this.addBuilding(i, "neutral-buildings");
        }

        for (var i = 0; i < 12; i++)
        {
            this.addBuilding(i, "player-buildings");
        }

        this.addStationMasters();
    }

    flipAndShuffle() {
        let container = document.getElementById("player-buildings") as HTMLDivElement;
        for (let elem of container.children)
        {
            if (elem instanceof HTMLDivElement)
            {
                let elemAny = elem as any;
                if (elemAny.rotDegrees === undefined)
                {
                    elemAny.rotDegrees = 0;
                }
                elemAny.rotDegrees += Math.floor((Math.random() * 4) + 5) * 180;
                elem.style.transform = `rotateY(${elemAny.rotDegrees}deg)`;
            }
        }
        this.animateShuffle("neutral-buildings");
        this.animateShuffle("station-masters");
    }

    animateShuffle(type: string)
    {
        let container = document.getElementById(type) as HTMLDivElement;

        // Record old locations, clear animations
        for (let i = 0; i < container.children.length; i++) {
            let building = container.children[i] as HTMLDivElement;
            building.style.animation = "none";
            this.oldLocations.set(building, {top: building.offsetTop, left: building.offsetLeft});
        }

        for (let i = container.children.length; i >= 0; i--) {
            // "| 0" casts to int
            container.appendChild(container.children[Math.random() * i | 0]);
        }

        // Animate shuffled elements
        for (let i = 0; i < container.children.length; i++) {
            let building = container.children[i] as HTMLDivElement;
            let oldOffset = this.oldLocations.get(building);

            building.style.setProperty("--old-pos-x", `${oldOffset.left - building.offsetLeft}px`);
            building.style.setProperty("--old-pos-y", `${oldOffset.top - building.offsetTop}px`);
            // the station masters that fade out shall not actually move visibly
            let duration = type == "station-masters" && i >= 5 ? 1000 : 1;
            building.style.animation = `shuffle ${duration}s ease-in-out`;
        }

        if (type == "station-masters") {
            // fade out station masters that were not selected
            for (let i = 5; i < container.children.length; i++) {
                let elem = container.children[i] as HTMLDivElement;
                elem.classList.add("fadeout");
                setTimeout(() => elem.style.setProperty("display", "none"), 1000);
            }
        }
    }

    addBuilding(index: number, type: "neutral-buildings" | "player-buildings"): HTMLDivElement
    {
        var a_col: number;
        var a_row: number;
        var b_col: number;
        var b_row: number;

        var container = document.getElementById(type);

        var buildingContainer = document.createElement("div");
        buildingContainer.classList.add("building-container");
        var building_a = document.createElement("div");
        var building_b = document.createElement("div");
        building_a.classList.add("building", "a-side");
        building_b.classList.add("building", "b-side");

        var building_a_text = document.createElement("div");
        building_a_text.classList.add("building-label");
        var building_b_text = document.createElement("div");
        building_b_text.classList.add("building-label");

        if (type == "neutral-buildings")
        {
            a_col = b_col = index;
            a_row = b_row = 0;

            building_a_text.textContent = building_b_text.textContent = String.fromCharCode('A'.charCodeAt(0) + index);
        }
        else if (type == "player-buildings")
        {
            a_col = (index * 2) % 11;
            a_row = Math.floor((index * 2) / 11) + 1;
            b_col = (index * 2 + 1) % 11;
            b_row = Math.floor((index * 2 + 1) / 11) + 1;

            building_a_text.textContent = `${index+1}a`;
            building_b_text.textContent = `${index+1}b`;

            buildingContainer.style.transition = `transform ${3}s ${index/8}s`;
        }

        building_a.style.setProperty("--building-row", a_row.toString());
        building_a.style.setProperty("--building-col", a_col.toString());
        building_b.style.setProperty("--building-row", b_row.toString());
        building_b.style.setProperty("--building-col", b_col.toString());
        
        buildingContainer.appendChild(building_a);
        buildingContainer.appendChild(building_b);
        container.appendChild(buildingContainer);
        building_a.appendChild(building_a_text);
        building_b.appendChild(building_b_text);

        return buildingContainer;
    }

    addStationMasters()
    {
        for (let col = 9; col < 11; col++)
            this.addStationMaster(1, col);

        for (let col = 0; col < 4; col++)
            this.addStationMaster(2, col);

        for (let col = 6; col < 9; col++)
            this.addStationMaster(2, col);
    }

    addStationMaster(row: number, col: number)
    {
        var container = document.getElementById("station-masters");
        var smContainer = document.createElement("div");
        smContainer.classList.add("sm-container");
        var stationMaster = document.createElement("div");
        stationMaster.classList.add("station-master");
        stationMaster.style.setProperty("--building-row", row.toString());
        stationMaster.style.setProperty("--building-col", col.toString());
        smContainer.appendChild(stationMaster);
        container.appendChild(smContainer);
    }
}
