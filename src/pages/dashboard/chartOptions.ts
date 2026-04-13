import type { ApexOptions } from 'apexcharts'

import { getColor } from '@/helpers/color'

export const getIdeasByDepartmentOptions = (
  labels: string[],
  values: number[],
): ApexOptions => ({
  chart: {
    type: 'bar',
    height: 320,
    toolbar: { show: false },
  },
  plotOptions: {
    bar: {
      horizontal: true,
      borderRadius: 6,
      borderRadiusApplication: 'end',
    },
  },
  dataLabels: {
    enabled: false,
  },
  colors: [getColor('primary')],
  series: [{ name: 'Ideas', data: values }],
  xaxis: {
    categories: labels,
    axisBorder: { show: false },
  },
  grid: {
    borderColor: getColor('border-color'),
  },
  tooltip: {
    y: {
      formatter: (value) => `${value} ideas`,
    },
  },
})

export const getIdeasByCategoryOptions = (
  labels: string[],
  values: number[],
): ApexOptions => ({
  chart: {
    type: 'bar',
    height: 320,
    toolbar: { show: false },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      borderRadius: 6,
      columnWidth: '48%',
    },
  },
  dataLabels: {
    enabled: false,
  },
  colors: [getColor('secondary')],
  series: [{ name: 'Ideas', data: values }],
  xaxis: {
    categories: labels,
    axisBorder: { show: false },
    labels: {
      rotate: -20,
      trim: true,
    },
  },
  grid: {
    borderColor: getColor('border-color'),
  },
  tooltip: {
    y: {
      formatter: (value) => `${value} ideas`,
    },
  },
})

export const getReportsByCategoryOptions = (
  labels: string[],
  values: number[],
): ApexOptions => ({
  chart: {
    type: 'donut',
    height: 320,
    toolbar: { show: false },
  },
  labels,
  series: values,
  colors: [
    getColor('danger'),
    getColor('warning'),
    getColor('primary'),
    getColor('info'),
    getColor('success'),
    getColor('secondary'),
  ],
  legend: {
    position: 'bottom',
    offsetY: 4,
  },
  stroke: {
    colors: [getColor('body-bg')],
  },
  tooltip: {
    y: {
      formatter: (value) => `${value} reports`,
    },
  },
})

export const getUsersByDepartmentOptions = (
  labels: string[],
  values: number[],
): ApexOptions => ({
  chart: {
    type: 'bar',
    height: 320,
    toolbar: { show: false },
  },
  plotOptions: {
    bar: {
      horizontal: true,
      borderRadius: 6,
      borderRadiusApplication: 'end',
    },
  },
  dataLabels: {
    enabled: false,
  },
  colors: [getColor('info')],
  series: [{ name: 'Users', data: values }],
  xaxis: {
    categories: labels,
    axisBorder: { show: false },
  },
  grid: {
    borderColor: getColor('border-color'),
  },
  tooltip: {
    y: {
      formatter: (value) => `${value} users`,
    },
  },
})

export const getMostViewedPagesOptions = (
  labels: string[],
  values: number[],
): ApexOptions => ({
  chart: {
    type: 'bar',
    height: 320,
    toolbar: { show: false },
  },
  plotOptions: {
    bar: {
      horizontal: true,
      borderRadius: 6,
      borderRadiusApplication: 'end',
    },
  },
  dataLabels: {
    enabled: false,
  },
  colors: [getColor('success')],
  series: [{ name: 'Views', data: values }],
  xaxis: {
    categories: labels,
    axisBorder: { show: false },
  },
  grid: {
    borderColor: getColor('border-color'),
  },
  tooltip: {
    y: {
      formatter: (value) => `${value} views`,
    },
  },
})

export const getMostActiveUsersOptions = (
  labels: string[],
  values: number[],
): ApexOptions => ({
  chart: {
    type: 'bar',
    height: 320,
    toolbar: { show: false },
  },
  plotOptions: {
    bar: {
      horizontal: true,
      borderRadius: 6,
      borderRadiusApplication: 'end',
    },
  },
  dataLabels: {
    enabled: false,
  },
  colors: [getColor('warning')],
  series: [{ name: 'Visits', data: values }],
  xaxis: {
    categories: labels,
    axisBorder: { show: false },
  },
  grid: {
    borderColor: getColor('border-color'),
  },
  tooltip: {
    y: {
      formatter: (value) => `${value} visits`,
    },
  },
})

export const getPopularIdeasOptions = (
  labels: string[],
  commentValues: number[],
  likeValues: number[],
): ApexOptions => ({
  chart: {
    type: 'bar',
    height: 320,
    toolbar: { show: false },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      borderRadius: 6,
      columnWidth: '50%',
    },
  },
  dataLabels: {
    enabled: false,
  },
  colors: [getColor('warning'), getColor('success')],
  series: [
    { name: 'Comments', data: commentValues },
    { name: 'Likes', data: likeValues },
  ],
  xaxis: {
    categories: labels,
    axisBorder: { show: false },
    labels: {
      rotate: -18,
      trim: true,
    },
  },
  legend: {
    position: 'top',
    offsetY: -5,
  },
  grid: {
    borderColor: getColor('border-color'),
  },
  tooltip: {
    y: {
      formatter: (value) => `${value}`,
    },
  },
})

export const getIdeaModerationSignalsOptions = (
  values: number[],
): ApexOptions => ({
  chart: {
    type: 'bar',
    height: 320,
    toolbar: { show: false },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      distributed: true,
      borderRadius: 8,
      columnWidth: '55%',
    },
  },
  dataLabels: {
    enabled: true,
    style: {
      fontSize: '12px',
      colors: [getColor('body-color')],
    },
  },
  colors: [getColor('danger'), getColor('secondary'), getColor('primary')],
  series: [{ name: 'Count', data: values }],
  xaxis: {
    categories: [
      'Ideas without comments',
      'Ideas anonymous',
      'Comments anonymous',
    ],
    axisBorder: { show: false },
    labels: {
      rotate: -18,
      trim: true,
    },
  },
  grid: {
    borderColor: getColor('border-color'),
  },
})
