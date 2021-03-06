import _ from "lodash";
import React, { Component } from "react";
import { View, FlatList, ActivityIndicator } from "react-native";
import { Actions } from "react-native-router-flux";
import { productFetch, followFetch, momentChecker,productExpired } from "../actions";
import FAB from "react-native-fab";
import ListProductItem from "../component/ListProductItem";
import Icon from "react-native-vector-icons/Ionicons";
import { connect } from "react-redux";
import firebase from "@firebase/app";
import { NavigationEvents } from "react-navigation";
import "@firebase/auth";

class ListProduct extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      data: "",
      error: null,
      stateUid: firebase.auth().currentUser.uid,
      followData: [],
      check: false
    };
  }

  componentDidMount() {
    this.props.followFetch(this.state.stateUid);
    this.props.productFetch();
    this.setState({
      data: this.props.product
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState(
      {
        data: nextProps.product,
        followData: nextProps.siguiendo
      },
      () => {
        this.filterList();
      }
    );
  }

  filterList() {
    const newData = this.state.data.filter(item => {
      if (
        new Date(
          item.date
            .split("-")
            .reverse()
            .join("-")
        ) < new Date(momentChecker()) &&
        item.status == "read"
      ) {
          this.props.productExpired(item.uid)
      } else if(item.status != "expired") {
        return (
          (_.includes(this.state.followData, item.owner, 0) == true ||
            item.owner == this.state.stateUid) &&
          (item.status.indexOf("read") != -1 || item.status.indexOf("noStock") != -1 )
        );
      }
    });
    this.setState({
      data: _.orderBy(newData, ["currentTime"], ["desc"]),
      loading: false
    });
  }

  render() {
    if (this.state.data == "") {
      return (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center"}}
        >
          <ActivityIndicator />
        </View>
      );
    }
    return (
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <NavigationEvents
          onWillFocus={() => {
            this.props.followFetch(this.state.stateUid);
          }}
        />
        <FlatList
          data={this.state.data}
          renderItem={({ item }) => (
            <ListProductItem product={item} uidUser={this.state.stateUid} />
          )}
          keyExtractor={item => item.uid}
          ListHeaderComponent={this.renderHeader}
        />
        <FAB
          buttonColor="#008000"
          iconTextColor="#FFFFFF"
          onClickAction={() => Actions.createOffer()}
          visible={true}
          iconTextComponent={<Icon name="md-pricetags" />}
        />
      </View>
    );
  }
}

const mapStateToProps = state => {
  const product = _.map(state.product, (val, uid) => {
    return { ...val, uid };
  });
  if (state.followRed != null) {
    const { siguiendo } = state.followRed;
    return { product, siguiendo };
  } else {
    return { product };
  }
};

export default connect(
  mapStateToProps,
  { productFetch, followFetch,momentChecker,productExpired }
)(ListProduct);
