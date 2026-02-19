const epochsInput = document.getElementById("epochs");
const weightInput = document.getElementById("weight");
const biasInput = document.getElementById("bias");
const lrInput = document.getElementById("lr");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const clearBtn = document.getElementById("clearBtn");
const modelWDisplay = document.getElementById("modelW");
const modelBDisplay = document.getElementById("modelB");

let isTraining = false;
let isPaused = false;
let trainingTimeout;

function generateData(idealW, idealB) {
    const xs = [];
    const ys = [];

    for (let i = 0; i < 50; i++) {
        const x = i / 10;
        const noise = (Math.random() - 0.5);
        const y = idealW * x + idealB + noise;

        xs.push(x);
        ys.push(y);
    }

    return {xs, ys};
}

function trainModel(xs, ys, epochs, lr, idealW, idealB) {
    let w = Math.random();
    let b = Math.random();

    let currentEpoch = 0;

    function step() {
        if (!isTraining || isPaused) return; // stop if paused
        if (currentEpoch >= epochs) {
            isTraining = false;

            epochsInput.disabled = false;
            weightInput.disabled = false;
            biasInput.disabled = false;
            lrInput.disabled = false;
            return;
        }

        let dw = 0;
        let db = 0;
        let totalLoss = 0;
        const n = xs.length;

        for (let i = 0; i < n; i++) {
            const yPred = w* xs[i] + b;
            const error = yPred - ys[i];

            dw += xs[i] * error;
            db += error;
            totalLoss += error*error;
        }

        dw = (2/n) * dw;
        db = (2/n) * db;

        w -= lr * dw;
        b -= lr * db;

        const loss = totalLoss / n

        updateChart(xs,ys,w,b,idealW,idealB);

        lossChart.data.labels.push(currentEpoch);
        lossChart.data.datasets[0].data.push(loss);
        lossChart.update();

        modelWDisplay.textContent = w.toFixed(3);
        modelBDisplay.textContent = b.toFixed(3);

        currentEpoch++;

        setTimeout(step, 80); //50ms delay

        
    }

    step();
}

function updateChart(xs,ys,w,b,idealW,idealB) {
    // Scatter data
    chart.data.datasets[0].data = xs.map((x,i) => ({
        x:x,
        y:ys[i]
    }));

    // Model line
    chart.data.datasets[1].data = xs.map(x => ({
        x: x,
        y: w*x+b
    }));

    // Ideal line
    chart.data.datasets[2].data = xs.map(x => ({
        x: x,
        y: idealW *x + idealB
    }));

    chart.update();
}

function updateIdealLine() {
    const idealW = parseFloat(weightInput.value);
    const idealB = parseFloat(biasInput.value);

    if (!currentXs.length) {
        // generate x points if none existing
        currentXs = Array.from({ length: 50 }, (_, i) => i /10);
    }

    // y values can be empty
    const ys = currentYs.length ? currentYs: currentXs.map(x => idealW * x + idealB);

    chart.data.datasets[2].data = currentXs.map(x => ({
        x: x,
        y: idealW * x + idealB
    }));
    chart.update();
}

const ctx = document.getElementById("chart").getContext("2d");

const chart = new Chart(ctx, {
    type: "scatter",
    data: {
        datasets: [
            {
                label: "Data",
                data: [],
            },
            {
                label: "Model Prediction",
                type: "line",
                data: [],
                fill: false,
            },
            {
                label: "True Line",
                type: "line",
                data: [],
                borderDash: [5,5],
                fill: false,
            }
        ]
    },
    options: {
        responsive: true,
        animation: false,
        scales: {
            x: { 
                type: "linear", 
                position: "bottom",
                min: 0,
                max: 5
            },
            y: {
                beginAtZero: false
            }
        }
    }
});

const lossCtx = document.getElementById("lossChart").getContext("2d");

const lossChart = new Chart(lossCtx, {
    type: "line",
    data: {
        labels: [],
        datasets: [
            {
                label: "Loss",
                data: [],
                fill: false,
            }
        ]
    },
    options: {
        animation: false,
        scales: {
            x: {
                title: { display: true, text: "Epoch"}
            },
            y: {
                title: {display: true, text: "Loss"}
            }
        }
    }
})


startBtn.addEventListener("click", () => {
    if (isTraining) return; // prevent double start
    
    isTraining = true;
    isPaused = false;
    pauseBtn.textContent = "Pause";

    epochsInput.disabled = true;
    weightInput.disabled = true;
    biasInput.disabled = true;
    lrInput.disabled = true;
    
    const epochs = parseInt(epochsInput.value);
    const idealW = parseFloat(weightInput.value);
    const idealB = parseFloat(biasInput.value);
    const lr = parseFloat(lrInput.value);

    const {xs, ys} = generateData(idealW, idealB);

    currentXs = xs;
    currentYs = ys;

    chart.options.scales.y.min = idealB-5;
    chart.options.scales.y.max = idealW * 5 + idealB + 5;
    chart.update();

    lossChart.data.labels = [];
    lossChart.data.datasets[0].data = []
    lossChart.update();

    trainModel(xs,ys,epochs,lr,idealW,idealB)
});

let currentXs = [];
let currentYs = [];

function remainingEpochs() {
    return parseInt(epochsInput.value) - lossChart.data.labels.length;
}

pauseBtn.addEventListener("click", () => {
    if (!isTraining) return;

    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? "Resume" : "Pause";

    if (!isPaused) {
        //resume
        trainModel(currentXs, currentYs, remainingEpochs(), parseFloat(lrInput.value),
                    parseFloat(weightInput.value), parseFloat(biasInput.value));
    } else {
        clearTimeout(trainingTimeout);
    }
});

clearBtn.addEventListener("click", () => {
    clearTimeout(trainingTimeout);
    isTraining = false;
    isPaused = false;
    pauseBtn.textContent = "Pause";

    epochsInput.disabled = false;
    weightInput.disabled = false;
    biasInput.disabled = false;
    lrInput.disabled = false;

    chart.data.datasets[0].data =[];
    chart.data.datasets[1].data = [];
    chart.data.datasets[2].data = [];
    chart.update();

    lossChart.data.labels = [];
    lossChart.data.datasets[0].data =[];
    lossChart.update();

    modelWDisplay.textContent ="-";
    modelBDisplay.textContent ="-";
});

weightInput.addEventListener("input", updateIdealLine);
biasInput.addEventListener("input", updateIdealLine);