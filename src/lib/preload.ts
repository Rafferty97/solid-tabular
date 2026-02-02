const importMessage = (module: string) => () => {
  console.info(`[PRELOAD] Loaded module "${module}"`)
}

export const preloadFormula = () => import('formula').then(importMessage('formula'))
export const preloadQueryEngine = () => import('query_engine').then(importMessage('query_engine'))
export const preloadECharts = () => import('echarts').then(importMessage('echarts'))
export const preloadProjectApp = () =>
  import('src/ProjectApp').then(importMessage('src/ProjectApp'))
export const preloadTable = () => import('src/table/Table').then(importMessage('src/table/Table'))
