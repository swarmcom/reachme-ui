<template>
  <canvas />
</template>

<script>
import Chart from 'chart.js'
import moment from 'moment'
import Datepicker from 'vuejs-datepicker'

export default {
  name: 'ReportWidgetChart',
  props: {
    value: {
      type: Array,
      default: () => ([])
    }
  },
  data () {
    return {
      chart: undefined,
      chart_data: undefined,
      palette: ['#7fc97f', '#beaed4', '#fdc086', '#ffff99', '#386cb0', '#f0027f', '#bf5b17', '#666666'],
      palette_id: 0
    }
  },
  watch: {
    value (n, old) {
      if (this.chart) {
        this.preprocess(n)
        this.chart.data = n
        this.chart.update()
      }
      return n
    }
  },
  created () {
  },
  mounted () {
    this.create_chart()
  },
  beforeDestroy () {
  },
  methods: {
    color (self) {
      self.palette_id = (self.palette_id+1) % self.palette.length
      return self.palette[self.palette_id]
    },
    update_chart (data) {
      this.chart.data = data
      this.chart.update()
    },
    create_chart () {
      this.chart = new Chart(this.$el, {
        type: 'line',
        data: this.value,
        options: {
          scales: {
            xAxes: [{
              type: 'time',
              time: {
                parser: (X) => new moment(X, "X")
              }
            }],
            yAxes: [{
              stacked: false,
            }]
          },
          tooltips: {
            callbacks: {
              label (item, dat) {
                return parseFloat(item.yLabel).toFixed(2)
              },
              title ([item], data) {
                return new moment(item.xLabel, "X").format("LLL")
              }
            }
          }
        }
      })
    },
    preprocess (data) {
      this.palette_id = 0
      data.datasets.forEach( (X) => {
        X.borderColor = this.color(this);
        X.fill = false
        X.steppedLine = 'before'
      })
    }
  }
}
</script>
