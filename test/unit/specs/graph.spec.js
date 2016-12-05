import Graph from '../../../src/graph.class'

describe('Graph', () => {
  let g = null
  beforeEach(() => {
    g = new Graph()
  })

  it('can add vertex', () => {
    g.addVertex('a')
    expect(Object.keys(g.vertices).length).toBe(1)
    expect(g.vertices['a'].name).toBe('a')
    expect(g.vertices['a'].adjList.length).toBe(0)
  })

  it('can add edges', () => {
    g.addVertex('a')
    g.addVertex('b')
    g.addEdge('a', 'b')
    expect(g.vertices['a'].prev).toBe(0)
    expect(g.vertices['a'].next).toBe(1)
    expect(g.vertices['a'].adjList.length).toBe(1)
    expect(g.vertices['a'].adjList[0]).toBe('b')
    expect(g.vertices['b'].prev).toBe(1)
    expect(g.vertices['b'].next).toBe(0)
    expect(g.vertices['b'].adjList.length).toBe(0)
  })

  it('can tell if the graph has any cycle', () => {
    g.addVertex('a')
    g.addVertex('b')
    g.addVertex('c')
    g.addVertex('d')
    g.addEdge('a', 'b')
    g.addEdge('b', 'c')
    g.addEdge('c', 'a')
    g.addEdge('a', 'd')
    expect(g.hasCycle()).toBe(true)

    g = new Graph()
    g.addVertex('a')
    g.addVertex('b')
    g.addEdge('a', 'b')
    g.addEdge('b', 'a')
    expect(g.hasCycle()).toBe(true)

    g = new Graph()
    g.addVertex('a')
    g.addVertex('b')
    g.addVertex('c')
    g.addVertex('d')
    g.addEdge('a', 'b')
    g.addEdge('b', 'c')
    g.addEdge('c', 'd')
    expect(g.hasCycle()).toBe(false)
  })

  it('can returns a bfs result of the graph', () => {
    g.addVertex('a')
    g.addVertex('b')
    g.addVertex('c')
    g.addVertex('d')
    g.addVertex('e')
    g.addEdge('a', 'b')
    g.addEdge('a', 'c')
    g.addEdge('b', 'd')
    const result = g.getBFS()
    expect(result.length).toBe(3)
    expect(result[0].length).toBe(2)
    expect(result[0]).toContain('a')
    expect(result[0]).toContain('e')
    expect(result[1].length).toBe(2)
    expect(result[1]).toContain('b')
    expect(result[1]).toContain('c')
    expect(result[2].length).toBe(1)
    expect(result[2]).toContain('d')
  })
})
