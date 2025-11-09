'use client'

import { ApexOptions } from 'apexcharts'
import { useEffect, useMemo, useState } from 'react'
import ReactApexChart from 'react-apexcharts'
import type { DailyStatsProps } from '../../../analytics/stats'

const options: ApexOptions = {
  legend: {
    show: false,
    position: 'top',
    horizontalAlign: 'left',
  },
  colors: ['#3C50E0', '#80CAEE'],
  chart: {
    fontFamily: 'system-ui, sans-serif',
    height: 335,
    type: 'area',
    dropShadow: {
      enabled: true,
      color: '#623CEA14',
      top: 10,
      blur: 4,
      left: 0,
      opacity: 0.1,
    },

    toolbar: {
      show: false,
    },
  },
  responsive: [
    {
      breakpoint: 1024,
      options: {
        chart: {
          height: 300,
        },
      },
    },
    {
      breakpoint: 1366,
      options: {
        chart: {
          height: 350,
        },
      },
    },
  ],
  stroke: {
    width: [2, 2],
    curve: 'straight',
  },
  grid: {
    xaxis: {
      lines: {
        show: true,
      },
    },
    yaxis: {
      lines: {
        show: true,
      },
    },
  },
  dataLabels: {
    enabled: false,
  },
  markers: {
    size: 4,
    strokeColors: '#fff',
    strokeWidth: 3,
    hover: {
      size: 8,
    },
  },
  xaxis: {
    type: 'category',
    categories: [],
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    title: {
      style: {
        fontSize: '0px',
      },
    },
    min: 0,
    max: 100,
  },
}

interface ChartOneState {
  series: {
    name: string
    data: number[]
  }[]
}

const RevenueAndProfitChart = ({ weeklyStats, isLoading }: DailyStatsProps) => {
  const dailyRevenueArray = useMemo(() => {
    if (!!weeklyStats && weeklyStats?.length > 0) {
      const sortedWeeks = weeklyStats?.sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      })
      return sortedWeeks.map((stat) => stat.total_revenue || 0)
    }
    return []
  }, [weeklyStats])

  const dailyProfitArray = useMemo(() => {
    if (!!weeklyStats && weeklyStats?.length > 0) {
      const sortedWeeks = weeklyStats?.sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      })
      return sortedWeeks.map((stat) => stat.total_profit || 0)
    }
    return []
  }, [weeklyStats])

  const daysOfWeekArr = useMemo(() => {
    if (!!weeklyStats && weeklyStats?.length > 0) {
      const sortedWeeks = weeklyStats?.sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      })
      const datesArr = sortedWeeks?.map((stat) => {
        const date = new Date(stat.date)
        return date.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
      })
      return datesArr
    }
    return []
  }, [weeklyStats])

  const [state, setState] = useState<ChartOneState>({
    series: [
      {
        name: 'Revenue',
        data: [],
      },
      {
        name: 'Profit',
        data: [],
      },
    ],
  })
  const [chartOptions, setChartOptions] = useState<ApexOptions>(options)

  useEffect(() => {
    if (dailyRevenueArray.length > 0 || dailyProfitArray.length > 0) {
      setState({
        series: [
          {
            name: 'Revenue',
            data: dailyRevenueArray,
          },
          {
            name: 'Profit',
            data: dailyProfitArray,
          },
        ],
      })
    }
  }, [dailyRevenueArray, dailyProfitArray])

  useEffect(() => {
    if (
      !!daysOfWeekArr &&
      daysOfWeekArr?.length > 0 &&
      !!dailyRevenueArray &&
      dailyRevenueArray?.length > 0
    ) {
      const maxValue = Math.max(...dailyRevenueArray, ...dailyProfitArray)
      setChartOptions({
        ...options,
        xaxis: {
          ...options.xaxis,
          categories: daysOfWeekArr,
        },
        yaxis: {
          ...options.yaxis,
          max: Math.ceil(maxValue / 100) * 100,
          min: 0,
        },
      })
    }
  }, [daysOfWeekArr, dailyRevenueArray, dailyProfitArray])

  if (isLoading) {
    return (
      <div className="border-border bg-card shadow-default sm:px-7.5 rounded-sm border px-5 pb-2.5 pt-6 xl:pb-1">
        <div className="flex h-[335px] items-center justify-center">
          <p className="text-muted-foreground">Loading chart...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="border-border bg-card shadow-default sm:px-7.5 rounded-sm border px-5 pb-2.5 pt-6 xl:pb-1">
      <div>
        <div className="flex w-full flex-col gap-0 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="text-foreground text-xl font-semibold">
              Revenue & Profit
            </h4>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="bg-primary block h-3 w-3 rounded-full"></span>
              <span className="text-muted-foreground text-sm font-medium">
                Revenue
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-[#80CAEE] block h-3 w-3 rounded-full"></span>
              <span className="text-muted-foreground text-sm font-medium">
                Profit
              </span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div id="chartOne" className="-ml-5">
          <ReactApexChart
            options={chartOptions}
            series={state.series}
            type="area"
            height={350}
          />
        </div>
      </div>
    </div>
  )
}

export default RevenueAndProfitChart
