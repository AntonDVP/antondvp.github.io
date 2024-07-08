document.addEventListener("DOMContentLoaded", () => {
    const baseColorInput = document.getElementById("baseColor");
    const hexColorInput = document.getElementById("hexColor");
    const colorNameDiv = document.getElementById("colorName");
    const rangeInput = document.getElementById("rangeInput");
    const rangeValueSpan = document.getElementById("rangeValue");
    const generateBtn = document.getElementById("generateBtn");
    const tintsColumn = document.getElementById("tintsColumn");
    const mainColorColumn = document.getElementById("mainColorColumn");
    const shadesColumn = document.getElementById("shadesColumn");
    const generationInfo = document.getElementById("generationInfo");
    const generatorTab = document.getElementById("generatorTab");
    const historyTab = document.getElementById("historyTab");
    const generatorContent = document.getElementById("generatorContent");
    const historyContent = document.getElementById("historyContent");
    const historyList = document.getElementById("historyList");
    const clearHistoryBtn = document.getElementById("clearHistoryBtn");
    let isInitialLoad = true;
    let currentGeneration = null;

    function switchTab(tabName) {
        if (tabName === "generator") {
            generatorTab.classList.add("active");
            historyTab.classList.remove("active");
            generatorContent.classList.add("active");
            historyContent.classList.remove("active");
        } else {
            generatorTab.classList.remove("active");
            historyTab.classList.add("active");
            generatorContent.classList.remove("active");
            historyContent.classList.add("active");
            loadHistory();
        }
    }

    function saveGeneration(baseColor, tints, shades) {
        const generation = {
            id: generateUniqueId(),
            baseColor: baseColor,
            tints: tints,
            shades: shades,
            timestamp: new Date().toISOString()
        };
        const history = JSON.parse(localStorage.getItem("colorHistory")) || [];
        history.unshift(generation);
        localStorage.setItem("colorHistory", JSON.stringify(history));
        return generation;
    }

    function loadHistory() {
        const history = JSON.parse(localStorage.getItem("colorHistory")) || [];
        historyList.innerHTML = "";
        history.forEach((entry) => {
            const date = new Date(entry.timestamp);
            const formattedDate = `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth() + 1).toString().padStart(2, "0")}.${date.getFullYear()}, ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
            const historyItem = document.createElement("div");
            historyItem.className = "history-item";
            historyItem.textContent = `${entry.baseColor} - ${getColorName(entry.baseColor)}, ${entry.tints.length + entry.shades.length}, ${formattedDate}`;
            const removeBtn = document.createElement("button");
            removeBtn.textContent = "X";
            removeBtn.className = "remove-btn";
            removeBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                removeHistoryEntry(entry.id);
            });
            historyItem.appendChild(removeBtn);
            historyItem.addEventListener("click", () => {
                loadGeneration(entry);
            });
            historyList.appendChild(historyItem);
        });
    }

    function removeHistoryEntry(id) {
        let history = JSON.parse(localStorage.getItem("colorHistory")) || [];
        history = history.filter(entry => entry.id !== id);
        localStorage.setItem("colorHistory", JSON.stringify(history));
        loadHistory();
    }

    function generateUniqueId() {
        const date = new Date();
        return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}${String(date.getHours()).padStart(2, "0")}${String(date.getMinutes()).padStart(2, "0")}${String(date.getSeconds()).padStart(2, "0")}${String(date.getMilliseconds()).padStart(3, "0")}`;
    }

    function loadGeneration(generation) {
        currentGeneration = generation;
        hexColorInput.value = generation.baseColor;
        baseColorInput.value = generation.baseColor;
        rangeInput.value = generation.tints.length * 2;
        rangeValueSpan.textContent = generation.tints.length * 2;
        displayColors(generation);
        displayGenerationInfo(generation, generation.tints.length + generation.shades.length);  // Update generation info display
    }

    function displayColors(generation = null) {
        const baseColor = tinycolor(hexColorInput.value);
        const tintShadeCount = parseInt(rangeInput.value, 10);
        const halfCount = Math.floor(tintShadeCount / 2);
        tintsColumn.innerHTML = "";
        mainColorColumn.innerHTML = "";
        shadesColumn.innerHTML = "";
        const tints = [];
        const shades = [];

        for (let i = halfCount; i > 0; i--) {
            const ratio = i / (halfCount + 1);
            const tint = tinycolor.mix(baseColor, "#ffffff", 100 * ratio).toHexString();
            tints.push({ color: tint, label: "" + 100 * (halfCount - i + 1) });
        }

        const mainColor = { color: baseColor.toHexString(), label: "" + 100 * (halfCount + 1) };

        for (let i = 1; i <= halfCount; i++) {
            const ratio = i / (halfCount + 1);
            const shade = tinycolor.mix(baseColor, "#000000", 100 * ratio).toHexString();
            shades.push({ color: shade, label: "" + 100 * (halfCount + 1 + i) });
        }

        tints.forEach(({ color, label }) => {
            tintsColumn.appendChild(createColorSwatch(color, label));
        });

        const mainColorSwatch = createColorSwatch(mainColor.color, mainColor.label);
        mainColorSwatch.classList.add("highlight");
        mainColorColumn.appendChild(mainColorSwatch);

        shades.forEach(({ color, label }) => {
            shadesColumn.appendChild(createColorSwatch(color, label));
        });

        const maxHeight = Math.max(tintsColumn.scrollHeight, shadesColumn.scrollHeight);
        mainColorSwatch.style.height = `${maxHeight}px`;
        updateColorName(baseColor.toHexString());

        if (isInitialLoad) {
            if (generation) {
                currentGeneration = generation;
                displayGenerationInfo(generation, tintShadeCount);
            } else {
                const existingHistory = JSON.parse(localStorage.getItem("colorHistory")) || [];
                if (!existingHistory.find(entry => entry.baseColor === baseColor.toHexString() && entry.tints.length === tints.length && entry.shades.length === shades.length)) {
                    currentGeneration = saveGeneration(baseColor.toHexString(), tints, shades);
                    displayGenerationInfo(currentGeneration, tintShadeCount);
                }
            }
            isInitialLoad = false;
        } else {
            const existingHistory = JSON.parse(localStorage.getItem("colorHistory")) || [];
            if (!existingHistory.find(entry => entry.baseColor === baseColor.toHexString() && entry.tints.length === tints.length && entry.shades.length === shades.length)) {
                currentGeneration = saveGeneration(baseColor.toHexString(), tints, shades);
                displayGenerationInfo(currentGeneration, tintShadeCount);
            }
        }
    }

    function createColorSwatch(color, label) {
        const swatch = document.createElement("div");
        swatch.className = "color-swatch";
        swatch.style.backgroundColor = color;
        const info = document.createElement("div");
        info.className = "color-info";
        info.style.color = tinycolor.mostReadable(color, ["#000", "#fff"]).toHexString();
        info.innerHTML = `<span class="codename">${label}</span><br><span class="hex-value">HEX: ${color.toUpperCase()}</span>`;
        const wcagInfo = document.createElement("div");
        wcagInfo.className = "wcag-info wcag-values";
        const wcagWhite = tinycolor.readability(color, "#fff");
        const wcagBlack = tinycolor.readability(color, "#000");
        wcagInfo.innerHTML = `On White: ${wcagWhite.toFixed(2)} (${getWcagRating(wcagWhite)}), On Black: ${wcagBlack.toFixed(2)} (${getWcagRating(wcagBlack)})`;
        info.appendChild(wcagInfo);
        swatch.appendChild(info);
        return swatch;
    }

    function getWcagRating(value) {
        return value >= 7 ? "AAA" : value >= 4.5 ? "AA" : value >= 3 ? "AA Large" : "Fail";
    }

    function updateColorName(color) {
        const colorObj = tinycolor(color);
        const name = getColorName(color);
        colorNameDiv.textContent = name;
        colorNameDiv.style.color = colorObj.isLight() ? "#000" : "#fff";
    }

    function getColorName(color) {
        const rgb = tinycolor(color).toRgb();
        let closestColor = null;
        let smallestDistance = Infinity;
        for (const colorEntry of colorNameList) {
            const entryRgb = tinycolor(colorEntry.hex).toRgb();
            const distance = Math.sqrt(Math.pow(rgb.r - entryRgb.r, 2) + Math.pow(rgb.g - entryRgb.g, 2) + Math.pow(rgb.b - entryRgb.b, 2));
            if (distance < smallestDistance) {
                smallestDistance = distance;
                closestColor = colorEntry;
            }
        }
        return closestColor ? closestColor.name : "";
    }

    function displayGenerationInfo(generation, tintShadeCount) {
        const date = new Date(generation.timestamp);
        const formattedDate = `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth() + 1).toString().padStart(2, "0")}.${date.getFullYear()}, ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
        const colorName = getColorName(generation.baseColor);
        generationInfo.textContent = `${generation.baseColor} - ${colorName}, ${tintShadeCount}, ${formattedDate}`;
    }

    function exportToFile(content, filename, mimeType) {
        const link = document.createElement("a");
        const blob = new Blob([content], { type: mimeType });
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    }

    function generateExportFilename() {
        const date = new Date(currentGeneration ? currentGeneration.timestamp : Date.now());
        const formattedDate = `${date.getDate().toString().padStart(2, "0")}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getFullYear()}-${date.getHours().toString().padStart(2, "0")}-${date.getMinutes().toString().padStart(2, "0")}`;
        const baseColor = currentGeneration ? currentGeneration.baseColor : hexColorInput.value;
        const colorName = getColorName(baseColor);
        return `${baseColor.substring(1)}_${colorName}_${rangeInput.value}_${formattedDate}`;
    }

    function exportAsImage() {
        const filename = generateExportFilename();
        html2canvas(document.querySelector(".color-container")).then((canvas) => {
            const link = document.createElement("a");
            link.download = `${filename}.png`;
            link.href = canvas.toDataURL();
            link.click();
        });
    }

    function exportAsText() {
        const filename = generateExportFilename();
        let content = "Color System:\n\n";
        document.querySelectorAll(".color-swatch").forEach((swatch) => {
            const label = swatch.querySelector(".codename").textContent;
            const hex = swatch.querySelector(".hex-value").textContent.split("HEX: ")[1];
            const wcagInfo = swatch.querySelector(".wcag-info").textContent.replace(/On White: (\d+\.\d+ \([A-Za-z ]+\))On Black: (\d+\.\d+ \([A-Za-z ]+\))/g, "On White: $1, On Black: $2");
            content += `${label}: ${hex}\nAccessibility (WCAG 2.2): ${wcagInfo}\n\n`;
        });
        exportToFile(content, `${filename}.txt`, "text/plain");
    }

    function exportAsTable() {
        const filename = generateExportFilename();
        let content = "Label,HEX,Accessibility (WCAG 2.2)\n";
        document.querySelectorAll(".color-swatch").forEach((swatch) => {
            const label = swatch.querySelector(".codename").textContent;
            const hex = swatch.querySelector(".hex-value").textContent.split("HEX: ")[1];
            const wcagInfo = swatch.querySelector(".wcag-info").textContent.replace(/On White: (\d+\.\d+ \([A-Za-z ]+\))On Black: (\d+\.\d+ \([A-Za-z ]+\))/g, "On White: $1, On Black: $2");
            content += `${label},${hex},${wcagInfo}\n`;
        });
        exportToFile(content, `${filename}.csv`, "text/csv");
    }

    function exportAsTokens() {
        const filename = generateExportFilename();
        const colorName = getColorName(currentGeneration.baseColor).toLowerCase().replace(/ /g, "_");
        const tokens = { [colorName]: {} };
        document.querySelectorAll(".color-swatch").forEach((swatch) => {
            const label = swatch.querySelector(".codename").textContent;
            const hex = swatch.querySelector(".hex-value").textContent.split("HEX: ")[1];
            tokens[colorName][label] = { value: hex, type: "color" };
        });
        exportToFile(JSON.stringify(tokens, null, 2), `${filename}.json`, "application/json");
    }

    generatorTab.addEventListener("click", () => switchTab("generator"));
    historyTab.addEventListener("click", () => switchTab("history"));
    clearHistoryBtn.addEventListener("click", () => {
        localStorage.removeItem("colorHistory");
        loadHistory();
    });

    baseColorInput.addEventListener("input", (e) => {
        const newColor = e.target.value;
        hexColorInput.value = newColor;
        updateColorName(newColor);
    });

    hexColorInput.addEventListener("input", (e) => {
        const newColor = e.target.value;
        if (tinycolor(newColor).isValid()) {
            baseColorInput.value = newColor;
            updateColorName(newColor);
        }
    });

    rangeInput.addEventListener("input", (e) => {
        rangeValueSpan.textContent = e.target.value;
    });

    generateBtn.addEventListener("click", () => {
        isInitialLoad = false;
        displayColors();
    });

    document.getElementById("exportImage").addEventListener("click", exportAsImage);
    document.getElementById("exportText").addEventListener("click", exportAsText);
    document.getElementById("exportTable").addEventListener("click", exportAsTable);
    document.getElementById("exportTokens").addEventListener("click", exportAsTokens);

    updateColorName(baseColorInput.value);
    displayColors();
});

const colorNameList = [
    { name: "Aqua", hex: "#00FFFF" }, { name: "Aliceblue", hex: "#F0F8FF" }, { name: "Antiquewhite", hex: "#FAEBD7" },
    { name: "Black", hex: "#000000" }, { name: "Blue", hex: "#0000FF" }, { name: "Cyan", hex: "#00FFFF" },
    { name: "Darkblue", hex: "#00008B" }, { name: "Darkcyan", hex: "#008B8B" }, { name: "Darkgreen", hex: "#006400" },
    { name: "Darkturquoise", hex: "#00CED1" }, { name: "Deepskyblue", hex: "#00BFFF" }, { name: "Green", hex: "#008000" },
    { name: "Lime", hex: "#00FF00" }, { name: "Mediumblue", hex: "#0000CD" }, { name: "Mediumspringgreen", hex: "#00FA9A" },
    { name: "Navy", hex: "#000080" }, { name: "Springgreen", hex: "#00FF7F" }, { name: "Teal", hex: "#008080" },
    { name: "Midnightblue", hex: "#191970" }, { name: "Dodgerblue", hex: "#1E90FF" }, { name: "Lightseagreen", hex: "#20B2AA" },
    { name: "Forestgreen", hex: "#228B22" }, { name: "Seagreen", hex: "#2E8B57" }, { name: "Darkslategray", hex: "#2F4F4F" },
    { name: "Darkslategrey", hex: "#2F4F4F" }, { name: "Limegreen", hex: "#32CD32" }, { name: "Mediumseagreen", hex: "#3CB371" },
    { name: "Turquoise", hex: "#40E0D0" }, { name: "Royalblue", hex: "#4169E1" }, { name: "Steelblue", hex: "#4682B4" },
    { name: "Darkslateblue", hex: "#483D8B" }, { name: "Mediumturquoise", hex: "#48D1CC" }, { name: "Indigo", hex: "#4B0082" },
    { name: "Darkolivegreen", hex: "#556B2F" }, { name: "Cadetblue", hex: "#5F9EA0" }, { name: "Cornflowerblue", hex: "#6495ED" },
    { name: "Mediumaquamarine", hex: "#66CDAA" }, { name: "Dimgray", hex: "#696969" }, { name: "Dimgrey", hex: "#696969" },
    { name: "Slateblue", hex: "#6A5ACD" }, { name: "Olivedrab", hex: "#6B8E23" }, { name: "Slategray", hex: "#708090" },
    { name: "Slategrey", hex: "#708090" }, { name: "Lightslategray", hex: "#778899" }, { name: "Lightslategrey", hex: "#778899" },
    { name: "Mediumslateblue", hex: "#7B68EE" }, { name: "Lawngreen", hex: "#7CFC00" }, { name: "Aquamarine", hex: "#7FFFD4" },
    { name: "Chartreuse", hex: "#7FFF00" }, { name: "Gray", hex: "#808080" }, { name: "Grey", hex: "#808080" },
    { name: "Maroon", hex: "#800000" }, { name: "Olive", hex: "#808000" }, { name: "Purple", hex: "#800080" },
    { name: "Lightskyblue", hex: "#87CEFA" }, { name: "Skyblue", hex: "#87CEEB" }, { name: "Blueviolet", hex: "#8A2BE2" },
    { name: "Darkmagenta", hex: "#8B008B" }, { name: "Darkred", hex: "#8B0000" }, { name: "Saddlebrown", hex: "#8B4513" },
    { name: "Darkseagreen", hex: "#8FBC8F" }, { name: "Lightgreen", hex: "#90EE90" }, { name: "Mediumpurple", hex: "#9370DB" },
    { name: "Darkviolet", hex: "#9400D3" }, { name: "Palegreen", hex: "#98FB98" }, { name: "Darkorchid", hex: "#9932CC" },
    { name: "Yellowgreen", hex: "#9ACD32" }, { name: "Sienna", hex: "#A0522D" }, { name: "Brown", hex: "#A52A2A" },
    { name: "Darkgray", hex: "#A9A9A9" }, { name: "Darkgrey", hex: "#A9A9A9" }, { name: "Greenyellow", hex: "#ADFF2F" },
    { name: "Lightblue", hex: "#ADD8E6" }, { name: "Paleturquoise", hex: "#AFEEEE" }, { name: "Lightsteelblue", hex: "#B0C4DE" },
    { name: "Powderblue", hex: "#B0E0E6" }, { name: "Firebrick", hex: "#B22222" }, { name: "Darkgoldenrod", hex: "#B8860B" },
    { name: "Mediumorchid", hex: "#BA55D3" }, { name: "Rosybrown", hex: "#BC8F8F" }, { name: "Darkkhaki", hex: "#BDB76B" },
    { name: "Silver", hex: "#C0C0C0" }, { name: "Mediumvioletred", hex: "#C71585" }, { name: "Indianred", hex: "#CD5C5C" },
    { name: "Peru", hex: "#CD853F" }, { name: "Chocolate", hex: "#D2691E" }, { name: "Tan", hex: "#D2B48C" },
    { name: "Lightgray", hex: "#D3D3D3" }, { name: "Lightgrey", hex: "#D3D3D3" }, { name: "Thistle", hex: "#D8BFD8" },
    { name: "Goldenrod", hex: "#DAA520" }, { name: "Orchid", hex: "#DA70D6" }, { name: "Palevioletred", hex: "#DB7093" },
    { name: "Crimson", hex: "#DC143C" }, { name: "Gainsboro", hex: "#DCDCDC" }, { name: "Plum", hex: "#DDA0DD" },
    { name: "Burlywood", hex: "#DEB887" }, { name: "Lightcyan", hex: "#E0FFFF" }, { name: "Lavender", hex: "#E6E6FA" },
    { name: "Darksalmon", hex: "#E9967A" }, { name: "Palegoldenrod", hex: "#EEE8AA" }, { name: "Violet", hex: "#EE82EE" },
    { name: "Azure", hex: "#F0FFFF" }, { name: "Honeydew", hex: "#F0FFF0" }, { name: "Khaki", hex: "#F0E68C" },
    { name: "Lightcoral", hex: "#F08080" }, { name: "Sandybrown", hex: "#F4A460" }, { name: "Beige", hex: "#F5F5DC" },
    { name: "Mintcream", hex: "#F5FFFA" }, { name: "Wheat", hex: "#F5DEB3" }, { name: "Whitesmoke", hex: "#F5F5F5" },
    { name: "Ghostwhite", hex: "#F8F8FF" }, { name: "Lightgoldenrodyellow", hex: "#FAFAD2" }, { name: "Linen", hex: "#FAF0E6" },
    { name: "Salmon", hex: "#FA8072" }, { name: "Oldlace", hex: "#FDF5E6" }, { name: "Bisque", hex: "#FFE4C4" },
    { name: "Blanchedalmond", hex: "#FFEBCD" }, { name: "Coral", hex: "#FF7F50" }, { name: "Cornsilk", hex: "#FFF8DC" },
    { name: "Darkorange", hex: "#FF8C00" }, { name: "Deeppink", hex: "#FF1493" }, { name: "Floralwhite", hex: "#FFFAF0" },
    { name: "Fuchsia", hex: "#FF00FF" }, { name: "Gold", hex: "#FFD700" }, { name: "Hotpink", hex: "#FF69B4" },
    { name: "Ivory", hex: "#FFFFF0" }, { name: "Lavenderblush", hex: "#FFF0F5" }, { name: "Lemonchiffon", hex: "#FFFACD" },
    { name: "Lightpink", hex: "#FFB6C1" }, { name: "Lightsalmon", hex: "#FFA07A" }, { name: "Lightyellow", hex: "#FFFFE0" },
    { name: "Magenta", hex: "#FF00FF" }, { name: "Mistyrose", hex: "#FFE4E1" }, { name: "Moccasin", hex: "#FFE4B5" },
    { name: "Navajowhite", hex: "#FFDEAD" }, { name: "Orange", hex: "#FFA500" }, { name: "Orangered", hex: "#FF4500" },
    { name: "Papayawhip", hex: "#FFEFD5" }, { name: "Peachpuff", hex: "#FFDAB9" }, { name: "Pink", hex: "#FFC0CB" },
    { name: "Red", hex: "#FF0000" }, { name: "Seashell", hex: "#FFF5EE" }, { name: "Snow", hex: "#FFFAFA" },
    { name: "Tomato", hex: "#FF6347" }, { name: "White", hex: "#FFFFFF" }, { name: "Yellow", hex: "#FFFF00" }
];