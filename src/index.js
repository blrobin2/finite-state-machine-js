import {h, render, Component} from 'preact'

const machine = {
  idle: {
    FETCH: 'loading'
  },
  loading: {
    RESOLVE: 'data',
    REJECT: 'error'
  },
  data: {
    FETCH: 'loading'
  },
  error: {
    FETCH: 'loading'
  }
}

const initialState = 'idle'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dataState: props.initialState,
      data: undefined
    }

    this.transition = this.transition.bind(this)
    this.fetchData = this.fetchData.bind(this)
    this.commands = {
      loading: this.fetchData
    }
  }

  fetchData() {
    fetch(`https://api.github.com/rate_limit`)
      .then(data => data.json())
      .then(data =>
        this.setState({ data },
          () => this.transition('RESOLVE')))
      .catch(_ => this.transition('REJECT'))
  }

  transition(action) {
    const { dataState } = this.state
    const nextState = this.props.machine[dataState][action]
    const command = this.commands[nextState]

    this.setState({
      dataState: nextState
    }, command)
  }

  render(props, state) {
    const { data, dataState } = state
    const buttonText = {
      idle: 'Fetch data',
      loading: "Loading...",
      error: 'Fetch fail, retry?',
      data: 'Fetch more data'
    }[dataState]

    return (
      <div>
        {data && <span><strong>Rate Limit:</strong> {data.rate.limit}</span>}
        {dataState === 'error' && <span>Error: data not found</span>}
        <button
          onClick={() => this.transition('FETCH')}
          disabled={dataState === 'loading'}>
          {buttonText}
        </button>
      </div>
    )
  }
}

render(<App machine={machine} initialState={initialState} />,
  document.getElementById('app'))
