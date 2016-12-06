import {
  isString,
  isObject,
  merge
} from './utils'

export default class Graph {
  constructor(vertices) {
    this.vertices = isObject(vertices) ? merge({}, vertices) : {}
  }

  addVertex(v) {
    if (isObject(this.vertices[v])) {
      return
    }
    const newVertex = {
      name: v,
      prev: 0,
      next: 0,
      adjList: []
    }
    this.vertices[v] = newVertex
  }

  addEdge(begin, end) {
    // check if two vertices exist
    if (!this.vertices[begin] ||
        !this.vertices[end] ||
        this.vertices[begin].adjList.indexOf(end) > -1) {
      return
    }
    ++this.vertices[begin].next
    this.vertices[begin].adjList.push(end)
    ++this.vertices[end].prev
  }

  hasCycle() {
    const cycleTestStack = []
    const vertices = merge({}, this.vertices)
    let popVertex = null

    for (let k in vertices) {
      if (vertices[k].prev === 0) {
        cycleTestStack.push(vertices[k])
      }
    }
    while (cycleTestStack.length > 0) {
      popVertex = cycleTestStack.pop()
      delete vertices[popVertex.name]
      popVertex.adjList.forEach(nextVertex => {
        --vertices[nextVertex].prev
        if (vertices[nextVertex].prev === 0) {
          cycleTestStack.push(vertices[nextVertex])
        }
      })
    }
    return Object.keys(vertices).length > 0
  }

  getBFS() {
    if (this.hasCycle()) {
      throw new Error('There are cycles in resource\'s dependency relations')
      return
    }
    const result = []
    const graphCopy = new Graph(this.vertices)
    while (Object.keys(graphCopy.vertices).length) {
      const noPrevVertices = []
      for (let k in graphCopy.vertices) {
        if (graphCopy.vertices[k].prev === 0) {
          noPrevVertices.push(k)
        }
      }
      if (noPrevVertices.length) {
        result.push(noPrevVertices)
        noPrevVertices.forEach(vertex => {
          graphCopy.vertices[vertex].adjList.forEach(next => {
            --graphCopy.vertices[next].prev
          })
          delete graphCopy.vertices[vertex]
        })
      }
    }
    return result
  }
}
