import React, { ReactDOM } from 'react'
import { connect } from 'react-redux'
// import ImmutableRenderMixin from 'react-immutable-render-mixin'
import * as ItemsActions from '../actions'
import { bindActionCreators } from 'redux'

class Index extends React.Component {
  // mixins: [ImmutableRenderMixin],

  render() {
    let styles = {
      width: '200px',
      margin: '30px auto 0'
    }

    let { dispatch } = this.props;
    const actions = this.props.actions
    let boundActionCreators = bindActionCreators(ItemsActions, dispatch);
    console.log(boundActionCreators)
    return (
      <div style={styles}>
        <h2>Manage Items</h2>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  items: state.items,
  filter: state.filter
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  // onClick: () => dispatch(setVisibilityFilter(ownProps.filter))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Index)
