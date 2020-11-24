import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import * as CanvasJS from './canvasjs.stock.min';

@Component({
  selector: 'app-advanced',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})

 
export class UserProfileComponent implements OnInit {
  addSymbols(e){
    var suffixes = ["", "K", "M", "B"];
    var order = Math.max(Math.floor(Math.log(e.value) / Math.log(1000)), 0);
    if(order > suffixes.length - 1)
      order = suffixes.length - 1;
    var suffix = suffixes[order];
    return CanvasJS.formatNumber(e.value / Math.pow(1000, order)) + suffix;
  }
    public ans;
    findGetParameter(parameterName) {
      var result = null,
          tmp = [];
      location.search
          .substr(1)
          .split("&")
          .forEach(function (item) {
            tmp = item.split("=");
            if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
          });
      return result;
    }

  ngOnInit() {
    
    let dataPoints1 = [], dataPoints2 = [], dataPoints3 = [];
    let dpsLength = 0;
    let chart = new CanvasJS.StockChart("chartContainer",{
      theme: "light2",
      exportEnabled: true,
      title:{
        text: this.findGetParameter("s") ? "Detailed Stock analysis for "+this.findGetParameter("s") : "Detailed Stock analysis"
      },
      subtitles: [{
        text: "USD"
      }],
      charts: [{
        toolTip: {
          shared: true
        },
        axisX: {
          lineThickness: 5,
          tickLength: 0,
          labelFormatter: function(e) {
            return "";
          },
          crosshair: {
            enabled: true,
            snapToDataPoint: true,
            labelFormatter: function(e) {
              return "";
            }
          }
        },
        axisY: {
          prefix: "$",
          tickLength: 0,
          title: this.findGetParameter("s") ? this.findGetParameter("s")+" Price" : "Price"
        },
        legend: {
          verticalAlign: "top"
        },
        data: [{
          name: "Price",
          yValueFormatString: "$#,###.##",
          xValueFormatString: "MMM DD YYYY",
          type: "candlestick",
          dataPoints : dataPoints1
        }]
      },{
        height: 100,
        toolTip: {
          shared: true
        },
        axisX: {
          crosshair: {
            enabled: true,
            snapToDataPoint: true,
            valueFormatString: "MMM DD YYYY"
          }
        },
        axisY: {
          prefix: "$",
          tickLength: 0,
          title: "Volume",
          labelFormatter: this.addSymbols
        },
        legend: {
          verticalAlign: "top"
        },
        data: [{
          name: "Volume",
          yValueFormatString: "$#,###.##",
          xValueFormatString: "MMM DD YYYY",
          dataPoints : dataPoints2
        }]
      }],
      navigator: {
        data: [{
          dataPoints: dataPoints3
        }],
        slider: {
          minimum: new Date("2020-02-01"),
          maximum: new Date("2020-05-01")
        }
      }
    });
    $.getJSON("https://canvasjs.com/data/docs/ethusd2018.json", function(data) {
      for(var i = 0; i < data.length; i++){
        dataPoints1.push({x: new Date(data[i].date), y: [Number(data[i].open), Number(data[i].high), Number(data[i].low), Number(data[i].close)]});;
        dataPoints2.push({x: new Date(data[i].date), y: Number(data[i].volume_usd)});
        dataPoints3.push({x: new Date(data[i].date), y: Number(data[i].close)});
      }
      chart.render();
    });
  }
}
