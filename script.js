const epochsInput = document.getElementById("epochs");
const weightInput = document.getElementById("weight");
const biasInput = document.getElementById("bias");
const lrInput = document.getElementById("lr");
const startBtn = document.getElementById("startBtn");

let isTraining = false;

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
        if (currentEpoch >= epochs) {
            isTraining = false;
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

        currentEpoch++;

        setTimeout(step, 50); //50ms delay

        
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
    
    const epochs = parseInt(epochsInput.value);
    const idealW = parseFloat(weightInput.value);
    const idealB = parseFloat(biasInput.value);
    const lr = parseFloat(lrInput.value);

    const {xs, ys} = generateData(idealW, idealB);

    chart.options.scales.y.min = idealB-5;
    chart.options.scales.y.max = idealW * 5 + idealB + 5;
    chart.update();

    lossChart.data.labels = [];
    lossChart.data.datasets[0].data = []
    lossChart.update();

    trainModel(xs,ys,epochs,lr,idealW,idealB)
});