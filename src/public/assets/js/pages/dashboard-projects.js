!(function(o) {
    "use strict";


    function t() {
        (this.$body = o("body")), (this.charts = []);
    }
    (t.prototype.respChart = function(r, a, e, i) {
        (Chart.defaults.font.color = "#8391a2"),
        (Chart.defaults.scale.grid.color = "#8391a2");
        var n = r.get(0).getContext("2d"),
            s = o(r).parent();
        return (function() {
            var t;
            switch ((r.attr("width", o(s).width()), a)) {
                case "Line":
                    t = new Chart(n, { type: "line", data: e, options: i });
                    break;
                case "Bar":
                    t = new Chart(n, { type: "bar", data: e, options: i });
                    break;
                case "Doughnut":
                    t = new Chart(n, { type: "doughnut", data: e, options: i });
            }
            return t;
        })();
    }),
    (t.prototype.initCharts = function() {
        var t,
            r,
            a,
            e = [];
        fetch('/soliciat-examenes-tipos', {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
        }).then((res) => {
            return res.json();
        }).then((res) => {
            return (
                0 < o("#task-area-chart").length &&
                ((t = {
                        labels: [
                            "Sprint 1",
                            "Sprint 2",
                            "Sprint 3",
                            "Sprint 4",
                            "Sprint 5",
                            "Sprint 6",
                            "Sprint 7",
                            "Sprint 8",
                            "Sprint 9",
                            "Sprint 10",
                            "Sprint 11",
                            "Sprint 12",
                            "Sprint 13",
                            "Sprint 14",
                            "Sprint 15",
                            "Sprint 16",
                            "Sprint 17",
                            "Sprint 18",
                            "Sprint 19",
                            "Sprint 20",
                            "Sprint 21",
                            "Sprint 22",
                            "Sprint 23",
                            "Sprint 24",
                        ],
                        datasets: [{
                            label: "This year",
                            backgroundColor: o("#task-area-chart").data("bgcolor") || "#727cf5",
                            borderColor: o("#task-area-chart").data("bordercolor") || "#727cf5",
                            data: [
                                16, 44, 32, 48, 72, 60, 84, 64, 78, 50, 68, 34, 26, 44, 32,
                                48, 72, 60, 74, 52, 62, 50, 32, 22,
                            ],
                        }, ],
                    }),
                    e.push(
                        this.respChart(o("#task-area-chart"), "Bar", t, {
                            maintainAspectRatio: !1,
                            barPercentage: 0.7,
                            categoryPercentage: 0.5,
                            plugins: {
                                filler: { propagate: !1 },
                                legend: { display: !1 },
                                tooltips: { intersect: !1 },
                                hover: { intersect: !0 },
                            },
                            scales: {
                                x: { grid: { color: "rgba(0,0,0,0.05)" } },
                                y: {
                                    ticks: { stepSize: 10, display: !1 },
                                    min: 10,
                                    max: 100,
                                    display: !0,
                                    borderDash: [5, 5],
                                    grid: { color: "rgba(0,0,0,0)", fontColor: "#fff" },
                                },
                            },
                        })
                    )),

                0 < o("#project-status-chart").length &&
                ((a = {
                        labels: ["Procesadas", "Pendientes", "Rechazadas"],
                        datasets: [{
                            data: [res.Procesados, res.Pendientes, res.Rechazados],
                            backgroundColor: (r = o("#project-status-chart").data("colors")) ?
                                r.split(",") : ["#0acf97", "#f9c851", "#fa5c7c"],
                            borderColor: "transparent",
                            borderWidth: "3",
                        }, ],
                    }),
                    e.push(
                        this.respChart(o("#project-status-chart"), "Doughnut", a, {
                            maintainAspectRatio: !1,
                            cutout: 80,
                            plugins: { cutoutPercentage: 40, legend: { display: !1 } },
                        })
                    )),
                e
            );
        })

    }),
    (t.prototype.init = function() {
        var r = this;
        (Chart.defaults.font.family =
            '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif'),
        (r.charts = this.initCharts()),
        o(window).on("resizeEnd", function(t) {
                o.each(r.charts, function(t, r) {
                        try {
                            r.destroy();
                        } catch (t) {}
                    }),
                    (r.charts = r.initCharts());
            }),
            o(window).resize(function() {
                this.resizeTO && clearTimeout(this.resizeTO),
                    (this.resizeTO = setTimeout(function() {
                        o(this).trigger("resizeEnd");
                    }, 500));
            });
    }),
    (o.ChartJs = new t()),
    (o.ChartJs.Constructor = t);

})(window.jQuery),
(function() {
    "use strict";
    window.jQuery.ChartJs.init();
})();