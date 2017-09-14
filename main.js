/*
 * tenhou-ranking: plot a graph of your Tenhou rank and pt
 * Copyright (C) 2016-2017 Pochang Chen
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
(function() {
    "use strict";
    const firstpt = {
        \u822c: 30,
        \u4e0a: 40,
        \u7279: 50,
        \u9cf3: 60
    };
    const secondpt = {
        \u822c: 0,
        \u4e0a: 10,
        \u7279: 20,
        \u9cf3: 30
    };
    const ranks = [
        { name: "\u65b0\u4eba", init:    0, penalty:   0, advance:   30, worth:    40, relegation: false},
        { name: "\uff19\u7d1a", init:    0, penalty:   0, advance:   30, worth:    70, relegation: false},
        { name: "\uff18\u7d1a", init:    0, penalty:   0, advance:   30, worth:   100, relegation: false},
        { name: "\uff17\u7d1a", init:    0, penalty:   0, advance:   60, worth:   130, relegation: false},
        { name: "\uff16\u7d1a", init:    0, penalty:   0, advance:   60, worth:   190, relegation: false},
        { name: "\uff15\u7d1a", init:    0, penalty:   0, advance:   60, worth:   250, relegation: false},
        { name: "\uff14\u7d1a", init:    0, penalty:   0, advance:   90, worth:   310, relegation: false},
        { name: "\uff13\u7d1a", init:    0, penalty:   0, advance:  100, worth:   400, relegation: false},
        { name: "\uff12\u7d1a", init:    0, penalty:  10, advance:  100, worth:   500, relegation: false},
        { name: "\uff11\u7d1a", init:    0, penalty:  20, advance:  100, worth:   600, relegation: false},
        { name: "\u521d\u6bb5", init:  200, penalty:  30, advance:  400, worth:   600, relegation:  true},
        { name: "\u4e8c\u6bb5", init:  400, penalty:  40, advance:  800, worth:   800, relegation:  true},
        { name: "\u4e09\u6bb5", init:  600, penalty:  50, advance: 1200, worth:  1200, relegation:  true},
        { name: "\u56db\u6bb5", init:  800, penalty:  60, advance: 1600, worth:  1800, relegation:  true},
        { name: "\u4e94\u6bb5", init: 1000, penalty:  70, advance: 2000, worth:  2600, relegation:  true},
        { name: "\u516d\u6bb5", init: 1200, penalty:  80, advance: 2400, worth:  3600, relegation:  true},
        { name: "\u4e03\u6bb5", init: 1400, penalty:  90, advance: 2800, worth:  4800, relegation:  true},
        { name: "\u516b\u6bb5", init: 1600, penalty: 100, advance: 3200, worth:  5200, relegation:  true},
        { name: "\u4e5d\u6bb5", init: 1800, penalty: 110, advance: 3600, worth:  6800, relegation:  true},
        { name: "\u5341\u6bb5", init: 2000, penalty: 120, advance: 4000, worth:  8600, relegation:  true},
        { name: "\u5929\u9cf3\u4f4d", init: 0, penalty: 0, advance:   0, worth: 14400, relegation: false},
    ];
    class Rank {
        constructor(rank) {
            if(rank) {
                this.rank = rank.rank;
                this.pt = rank.pt;
            } else {
                this.rank = 0;
                this.pt = 0;
            }
        }
        increasept(amount) {
            if(this.rank == ranks.length - 1)
                return;
            this.pt += amount | 0;
            if(this.pt >= ranks[this.rank].advance) {
                this.rank++;
                this.pt = ranks[this.rank].init;
            }
        }
        decreasept(multiplier) {
            this.pt -= (ranks[this.rank].penalty * multiplier) | 0;
            if(this.pt < 0) {
                if(ranks[this.rank].relegation) {
                    this.rank--;
                    this.pt = ranks[this.rank].init;
                } else {
                    this.pt = 0;
                }
            }
        }
        worth() {
            return ranks[this.rank].worth + this.pt;
        }
        toString() {
            if(this.rank == ranks.length - 1)
                return ranks[this.rank].name;
            return ranks[this.rank].name + " " + this.pt + "pt";
        }
    };
    function parse(itemstr) {
        try {
            var fields = itemstr.split(/\|/);
            if(fields[1].trim() !== "L0000")
                return null;
            if(fields[5].trim()[0] != '\u56db')
                return null;
            return {
                place : +fields[0].trim().substr(0, 1),
                date  : new Date(fields[3].trim() + "T" + fields[4].trim() + "+09:00"),
                type  : fields[5].trim().substr(0, 3)
            };
        } catch (e) {
            return null;
        }
    }
    function process(input) {
        input = input.split(/[\r\n]+/);
        var items = [], goodstr = "";
        for(let i = 0; i < input.length; i++) {
            let item = parse(input[i]);
            if (item) {
                items.push(item);
                goodstr += input[i] + "\n";
            }
        }
        var rank = new Rank();
        var result = [];
        for(let i = 0; i < items.length; i++) {
            let it = items[i];
            let m = it.type[2] === '\u5357' ? 1.5 : 1;
            switch(it.place) {
            case 1:
                rank.increasept(firstpt[it.type[1]] * m);
                break;
            case 2:
                rank.increasept(secondpt[it.type[1]] * m);
                break;
            case 4:
                rank.decreasept(m);
                break;
            }
            result.push({
                x: it.date,
                y: rank.worth(),
                rank: new Rank(rank),
                games: i,
            });
        }
        return {
            result: result,
            goodstr: goodstr,
        };
    }
    const pointBgColor = [
        "silver", "silver", "silver", "silver", "silver",
        "silver", "silver", "silver", "silver",
        "yellow", "lime", "aqua", "blue", "fuchsia", "red",
        "yellow", "lime", "aqua", "blue", "fuchsia",
        "black"
    ];
    function getPointBackgroundColor(pt) {
        return pointBgColor[pt.rank.rank];
    }
    var chart;
    function ontrigger() {
        var input = document.getElementById("input");
        var result = process(input.value);
        initChart();
        showResult(result.result);
        input.value = result.goodstr;
    }
    function initChart() {
        if (chart)
            return;
        var ctx = document.getElementById("chart");
        chart = new Chart(ctx, {
            type: "line",
            data: {
                datasets: [{
                    fill: false,
                    steppedLine: true,
                    pointBackgroundColor: [],
                    data: [],
                }]
            },
            options: {
                legend : {
                    display: false
                },
                tooltips: {
                    callbacks: {
                        label: () => "Something went wrong!",
                    }
                },
                scales: {
                    xAxes: [{
                        type: "time"
                    }]
                }
            }
        });
    }
    function showResult(result) {
        chart.data.datasets[0].pointBackgroundColor = result.map(getPointBackgroundColor);
        chart.data.datasets[0].data = result;
        chart.options.tooltips.callbacks.label = function (x) {
            var r = result[x.index];
            return r.rank + " (" + r.games + ")";
        };
        chart.update();
    }
    trigger.onclick = ontrigger;
})();
