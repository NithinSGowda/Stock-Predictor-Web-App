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
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    var stock = urlParams.get('s')
    stock=stock ? stock : "fb"
    
    let dataPoints1 = [], dataPoints2 = [], dataPoints3 = [];
    let dpsLength = 0;
    let chart = new CanvasJS.StockChart("chartContainer",{
      theme: "dark2",
      exportEnabled: true,
      title:{
        text: stock ? "Detailed Stock analysis for "+stock : "Detailed Stock analysis"
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
          title: stock ? stock+" Price" : "Price"
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
    $.getJSON("http://52.172.154.53:8080/data/full/"+stock, function(data) {
      for(var i = 0; i < data.length; i++){
        dataPoints1.push({x: new Date(data[i].Date), y: [Number(data[i].Open), Number(data[i].High), Number(data[i].Low), Number(data[i].Close)]});;
        dataPoints2.push({x: new Date(data[i].Date), y: Number(data[i].Volume)});
        dataPoints3.push({x: new Date(data[i].Date), y: Number(data[i].Close)});
      }
      chart.render();
    });

  }
}
