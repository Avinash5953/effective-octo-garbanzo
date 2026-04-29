// ============ DATA GENERATION ============

// generate a random integer between min and max (inclusive)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// synthetic dataset generation
function generateDataset() {
    var postTypes = ["image", "video", "text"];
    var postTimes = ["morning", "afternoon", "evening", "night"];
    var data = [];
    var totalEntries = getRandomInt(350, 400);

    for (var i = 1; i <= totalEntries; i++) {
        var type = postTypes[getRandomInt(0, 2)];
        var time = postTimes[getRandomInt(0, 3)];

        // different engagement ranges depending on type
        var likes, comments, shares, followers;

        if (type === "video") {
            likes = getRandomInt(100, 800);
            comments = getRandomInt(20, 200);
            shares = getRandomInt(10, 150);
        } else if (type === "image") {
            likes = getRandomInt(50, 500);
            comments = getRandomInt(10, 120);
            shares = getRandomInt(5, 80);
        } else {
            likes = getRandomInt(10, 250);
            comments = getRandomInt(5, 60);
            shares = getRandomInt(2, 40);
        }

        followers = getRandomInt(500, 50000);

        data.push({
            post_id: i,
            post_type: type,
            likes: likes,
            comments: comments,
            shares: shares,
            followers: followers,
            post_time: time
        });
    }

    return data;
}

// generate dataset once
var dataset = generateDataset();
var filteredData = dataset.slice(); // copy for filtering

// ============ OVERVIEW STATS ============

function updateOverview(data) {
    var totalPosts = data.length;
    var totalLikes = 0;
    var totalComments = 0;
    var totalShares = 0;

    for (var i = 0; i < data.length; i++) {
        totalLikes += data[i].likes;
        totalComments += data[i].comments;
        totalShares += data[i].shares;
    }

    document.getElementById("totalPosts").textContent = totalPosts;
    document.getElementById("avgLikes").textContent = totalPosts > 0 ? Math.round(totalLikes / totalPosts) : 0;
    document.getElementById("avgComments").textContent = totalPosts > 0 ? Math.round(totalComments / totalPosts) : 0;
    document.getElementById("avgShares").textContent = totalPosts > 0 ? Math.round(totalShares / totalPosts) : 0;
}

// ============ FILTERS ============

function applyFilters() {
    var typeVal = document.getElementById("postTypeFilter").value;
    var timeVal = document.getElementById("postTimeFilter").value;

    filteredData = dataset.filter(function (item) {
        var typeMatch = (typeVal === "all") || (item.post_type === typeVal);
        var timeMatch = (timeVal === "all") || (item.post_time === timeVal);
        return typeMatch && timeMatch;
    });

    // refresh everything with filtered data
    updateOverview(filteredData);
    updateCharts(filteredData);
    updateInsights(filteredData);
    updateTable(filteredData);
}

function resetFilters() {
    document.getElementById("postTypeFilter").value = "all";
    document.getElementById("postTimeFilter").value = "all";
    filteredData = dataset.slice();

    updateOverview(filteredData);
    updateCharts(filteredData);
    updateInsights(filteredData);
    updateTable(filteredData);
}

// ============ CHARTS ============

var barChart, scatterChart, lineChart, pieChart;

function updateCharts(data) {
    createBarChart(data);
    createScatterChart(data);
    createLineChart(data);
    createPieChart(data);
}

// bar chart: post type vs average likes
function createBarChart(data) {
    var types = ["image", "video", "text"];
    var avgLikes = [];

    for (var t = 0; t < types.length; t++) {
        var filtered = data.filter(function (d) { return d.post_type === types[t]; });
        var sum = 0;
        for (var i = 0; i < filtered.length; i++) {
            sum += filtered[i].likes;
        }
        var avg = filtered.length > 0 ? Math.round(sum / filtered.length) : 0;
        avgLikes.push(avg);
    }

    // destroy old chart if exists
    if (barChart) barChart.destroy();

    var ctx = document.getElementById("barChart").getContext("2d");
    barChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Image", "Video", "Text"],
            datasets: [{
                label: "Average Likes",
                data: avgLikes,
                backgroundColor: ["#4a6cf7", "#e74c3c", "#f39c12"],
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// scatter chart: likes vs comments
function createScatterChart(data) {
    var points = [];
    for (var i = 0; i < data.length; i++) {
        points.push({ x: data[i].likes, y: data[i].comments });
    }

    if (scatterChart) scatterChart.destroy();

    var ctx = document.getElementById("scatterChart").getContext("2d");
    scatterChart = new Chart(ctx, {
        type: "scatter",
        data: {
            datasets: [{
                label: "Likes vs Comments",
                data: points,
                backgroundColor: "rgba(74, 108, 247, 0.5)",
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { title: { display: true, text: "Likes" } },
                y: { title: { display: true, text: "Comments" } }
            }
        }
    });
}

// line chart: engagement trends (grouped by post_id batches)
function createLineChart(data) {
    // group data into batches of 20 to show trends
    var batchSize = 20;
    var labels = [];
    var likesData = [];
    var commentsData = [];
    var sharesData = [];

    for (var i = 0; i < data.length; i += batchSize) {
        var batch = data.slice(i, i + batchSize);
        var batchNum = Math.floor(i / batchSize) + 1;
        labels.push("Batch " + batchNum);

        var sumL = 0, sumC = 0, sumS = 0;
        for (var j = 0; j < batch.length; j++) {
            sumL += batch[j].likes;
            sumC += batch[j].comments;
            sumS += batch[j].shares;
        }

        likesData.push(Math.round(sumL / batch.length));
        commentsData.push(Math.round(sumC / batch.length));
        sharesData.push(Math.round(sumS / batch.length));
    }

    if (lineChart) lineChart.destroy();

    var ctx = document.getElementById("lineChart").getContext("2d");
    lineChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Avg Likes",
                    data: likesData,
                    borderColor: "#4a6cf7",
                    backgroundColor: "rgba(74, 108, 247, 0.1)",
                    fill: true,
                    tension: 0.3
                },
                {
                    label: "Avg Comments",
                    data: commentsData,
                    borderColor: "#e74c3c",
                    backgroundColor: "rgba(231, 76, 60, 0.1)",
                    fill: true,
                    tension: 0.3
                },
                {
                    label: "Avg Shares",
                    data: sharesData,
                    borderColor: "#27ae60",
                    backgroundColor: "rgba(39, 174, 96, 0.1)",
                    fill: true,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// pie chart: post type distribution
function createPieChart(data) {
    var imageCount = 0, videoCount = 0, textCount = 0;

    for (var i = 0; i < data.length; i++) {
        if (data[i].post_type === "image") imageCount++;
        else if (data[i].post_type === "video") videoCount++;
        else textCount++;
    }

    if (pieChart) pieChart.destroy();

    var ctx = document.getElementById("pieChart").getContext("2d");
    pieChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Image", "Video", "Text"],
            datasets: [{
                data: [imageCount, videoCount, textCount],
                backgroundColor: ["#4a6cf7", "#e74c3c", "#f39c12"]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: "bottom" }
            }
        }
    });
}

// ============ INSIGHTS ============

function updateInsights(data) {
    var insightsList = document.getElementById("insightsList");
    insightsList.innerHTML = "";

    if (data.length === 0) {
        insightsList.innerHTML = "<li>No data available for the selected filters.</li>";
        return;
    }

    // calculate some stats
    var totalLikes = 0, totalComments = 0, totalShares = 0;
    var maxLikes = data[0].likes;
    var maxLikesPost = data[0];

    for (var i = 0; i < data.length; i++) {
        totalLikes += data[i].likes;
        totalComments += data[i].comments;
        totalShares += data[i].shares;

        if (data[i].likes > maxLikes) {
            maxLikes = data[i].likes;
            maxLikesPost = data[i];
        }
    }

    var avgLikes = Math.round(totalLikes / data.length);
    var avgComments = Math.round(totalComments / data.length);
    var totalEngagement = totalLikes + totalComments + totalShares;

    // find most engaging post type
    var typeCounts = { image: { count: 0, likes: 0 }, video: { count: 0, likes: 0 }, text: { count: 0, likes: 0 } };
    for (var i = 0; i < data.length; i++) {
        typeCounts[data[i].post_type].count++;
        typeCounts[data[i].post_type].likes += data[i].likes;
    }

    var bestType = "image";
    var bestAvg = 0;
    for (var type in typeCounts) {
        if (typeCounts[type].count > 0) {
            var avg = typeCounts[type].likes / typeCounts[type].count;
            if (avg > bestAvg) {
                bestAvg = avg;
                bestType = type;
            }
        }
    }

    // find best posting time
    var timeCounts = { morning: { count: 0, likes: 0 }, afternoon: { count: 0, likes: 0 }, evening: { count: 0, likes: 0 }, night: { count: 0, likes: 0 } };
    for (var i = 0; i < data.length; i++) {
        timeCounts[data[i].post_time].count++;
        timeCounts[data[i].post_time].likes += data[i].likes;
    }

    var bestTime = "morning";
    var bestTimeAvg = 0;
    for (var time in timeCounts) {
        if (timeCounts[time].count > 0) {
            var avg = timeCounts[time].likes / timeCounts[time].count;
            if (avg > bestTimeAvg) {
                bestTimeAvg = avg;
                bestTime = time;
            }
        }
    }

    // build insight items
    var insights = [
        "The most popular post type is <strong>" + bestType + "</strong> with an average of <strong>" + Math.round(bestAvg) + "</strong> likes per post.",
        "Post #" + maxLikesPost.post_id + " (" + maxLikesPost.post_type + ") received the highest likes: <strong>" + maxLikes + "</strong>.",
        "Total engagement across all posts: <strong>" + totalEngagement.toLocaleString() + "</strong> (likes + comments + shares).",
        "The best time to post is during the <strong>" + bestTime + "</strong> with an average of <strong>" + Math.round(bestTimeAvg) + "</strong> likes.",
        "On average, each post gets <strong>" + avgLikes + "</strong> likes and <strong>" + avgComments + "</strong> comments."
    ];

    for (var i = 0; i < insights.length; i++) {
        var li = document.createElement("li");
        li.innerHTML = insights[i];
        insightsList.appendChild(li);
    }
}

// ============ PREDICTION ============

function predictLikes() {
    var comments = parseFloat(document.getElementById("inputComments").value);
    var followers = parseFloat(document.getElementById("inputFollowers").value);

    // validate inputs
    if (isNaN(comments) || isNaN(followers) || comments < 0 || followers < 0) {
        alert("Please enter valid positive numbers for both fields.");
        return;
    }

    // simple formula: likes = (comments * 2) + (followers * 0.05)
    var predictedLikes = Math.round((comments * 2) + (followers * 0.05));

    var resultDiv = document.getElementById("predictionResult");
    resultDiv.style.display = "block";
    resultDiv.innerHTML = "Predicted Likes: <span style='font-size: 24px;'>" + predictedLikes + "</span>";
}

// ============ DATA TABLE ============

function updateTable(data) {
    var tbody = document.querySelector("#dataTable tbody");
    tbody.innerHTML = "";

    // show first 20 entries
    var limit = Math.min(data.length, 20);

    for (var i = 0; i < limit; i++) {
        var row = document.createElement("tr");
        row.innerHTML =
            "<td>" + data[i].post_id + "</td>" +
            "<td>" + data[i].post_type + "</td>" +
            "<td>" + data[i].likes + "</td>" +
            "<td>" + data[i].comments + "</td>" +
            "<td>" + data[i].shares + "</td>" +
            "<td>" + data[i].followers.toLocaleString() + "</td>" +
            "<td>" + data[i].post_time + "</td>";
        tbody.appendChild(row);
    }
}

// ============ INITIALIZE ============

// run everything when page loads
window.onload = function () {
    updateOverview(filteredData);
    updateCharts(filteredData);
    updateInsights(filteredData);
    updateTable(filteredData);
};
