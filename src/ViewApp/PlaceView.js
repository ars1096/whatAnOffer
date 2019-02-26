import React, { Component } from "react";
import _ from 'lodash';
import { View, ListView, Text } from "react-native";
import { placeFetch } from "../actions";
import { connect } from "react-redux"
import {Button} from '../component';
import { Actions } from "react-native-router-flux";
import Geohash from  'latlon-geohash';

class PlaceView extends Component {
  
  state = { noCoincidence: null }
  
  componentDidMount () {
    
    state = { kindProduct: this.props.values, kindSection: this.props.kindSectionVal}
  }

  componentWillMount() {
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = parseFloat(position.coords.latitude)
      const long = parseFloat(position.coords.longitude)
       geoHash = Geohash.encode(lat, long, 7)
      this.props.placeFetch(geoHash);
      },
       (error1) => this.setState({error1: error.message}),
       {enableHighAccuracy: false, timeout: 5000, maximumAge: 1000}
       );
      this.createDataSource(this.props);
  }
  
  componentWillReceiveProps(newProps) {    
    this.createDataSource(newProps);

  }
  
  createDataSource({ place }) {
    this.setState({noCoincidence: place.length})
    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2
    });
    
    this.dataSource = ds.cloneWithRows(place);
  }
  
  renderRow(placeToSend){
    return <ListPlaces place = { placeToSend } prodVal = {this.state.kindProduct}  kindOfProduct = {this.state.kindSection}  />
  }
  
  render() {
          return (
           
           <View style={{ flex: 1, backgroundColor : "white"}}>
           {this.state.noCoincidence == 0 ? 
           <View style={ styles.container }><Text style={ styles.notFoundStyle }>No se han encontrado coincidencias :(</Text></View> 
           : null }
           <ListView
           enableEmptySections
           dataSource={this.dataSource}
           renderRow={this.renderRow}
           />
          
          </View>
           
         );
       }
     }
     
     const mapStateToProps = (state) => {
       const place = _.map(state.place, (val, uid) => {
           return { ...val, uid};
       });
       return { place }
     
     };
     export default connect( mapStateToProps,{ placeFetch })(PlaceView);




  class ListPlaces extends Component {
  onItemPress(value) {
    Actions.finalCreateOffer({ placeValue: value, productValue: this.props.prodVal, productKindValue: this.props.kindOfProduct});
  }

  render() {
    
    const payment = [];
    const { uid } = this.props.place;
    for (var key in this.props.place) {
      if( key != "uid" && key != "Geohash" ){
      const val  = this.props.place[key];
      payment.push( <Button key= { this.props.place[key] } value= { this.props.place[key] } onPress= { () => this.onItemPress(val) } style= {{ backgroundColor:"white", borderColor:"grey", borderWidth:0, borderBottomWidth: 1,borderRadius:0, marginLeft:0, marginRight:0}}><Text style={{color:"black"}}>{this.props.place[key]}</Text></Button>)
      }
    }
    
    return (

      <View >
        <View>
          <Text style={ styles.textStyle }>{uid}</Text>
          {payment}
        </View>
     
      </View>
    );
  }
}

const styles = {
  textStyle:{
    textAlign:'center', 
    fontSize: 18, 
    backgroundColor: "#30A66D", 
    color:"white"
  },
  container: {
    justifyContent: "center", 
    alignItems:"center", 
    flex: 1
  },
  notFoundStyle:{
    color: "grey", 
    fontSize: 20, 
    textAlign: "center"
  }
}

