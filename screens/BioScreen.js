import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Text, Image, Dimensions, InteractionManager, } from 'react-native';
import { ExpoLinksView } from '@expo/samples';

import * as FirebaseAPI from '../modules/firebaseAPI'

const {height, width} = Dimensions.get('window');

export default class BioScreen extends React.Component {
  static navigationOptions = {
    headerLeft: null,
    gesturesEnabled: false,
    timer: {},
  };

  componentWillMount() {
      this.state = {
        user: this.props.screenProps.user, 
        profiles: [],
      }

      this.getProfiles()

      this._mounted = false
  }

  componentDidMount() {
    this._mounted = true
  }

  componentWillUpdate() {
    this._mounted = false
  }

  componentWillUnmount() {
    // this.stopWatchingUsers()
  }

  watchProfiles() {
    InteractionManager.runAfterInteractions(() => {
        this.state.profiles.forEach((profile) => { 
          FirebaseAPI.removeWatchUser(profile.uid)

          FirebaseAPI.watchUser(profile.uid, (updatedProfile) => {
            const index = this.state.profiles.findIndex((user) => { return user.uid == updatedProfile.uid })
            const updatedProfiles = this.state.profiles

            updatedProfiles[index] = updatedProfile

            this.setState({profiles: updatedProfiles})
          })

          FirebaseAPI.watchForNewChat(this.state.user.uid, profile.uid, (hasChat) => {
            if(hasChat) {
              this.removeProfile(profile)
            }
          })
        })
      })
  }

  getProfiles() {
    FirebaseAPI.getAllUsers((users) => {
        FirebaseAPI.getProfilesInChatsWithKey(this.state.user.uid, (chattedProfiles) => {
          //Filter out the current user from the other individuals
          this.setState({profiles: users.filter((user) => {
            return user.uid != this.state.user.uid 
            }).filter((user) => { //Filter profiles already in chat with user
              return !(chattedProfiles.some((profile) => {
                return profile.uid == user.uid
                }))
            }).filter((user) => { //Filter rejected profiles
              if(this.state.user.rejections != undefined)
                return !Object.keys(this.state.user.rejections).some((uid) => {
                  return uid == user.uid
                })
              else
                return true

            }).slice(0, 4) //only show 4 profiles
          })

        this.watchProfiles()
        })
      })
  }

  getAge(dateString) {
    console.log(dateString)
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
  }


  showProfile(profile) {
    this.props.navigation.navigate('Profile', {profile: profile, user: this.state.user})
  }

  getFbImageUrl(profile) {
    const fbImageUrl = `https://graph.facebook.com/${profile.id}/picture?height=${height}`
    return fbImageUrl
  }

  removeProfile(profile) {
    const index = this.state.profiles.findIndex((user) => { return user.uid == profile.uid })
    const updatedProfiles = this.state.profiles

    FirebaseAPI.removeWatchUser(profile.uid)

    updatedProfiles.splice(index, 1)

    this.setState({profiles: updatedProfiles})
    InteractionManager.runAfterInteractions(() => {
      this.getProfiles()                
    })
  }

  rejectProfile(profile) {
    FirebaseAPI.rejectProfileFromUser(this.state.user.uid, profile.uid)
    FirebaseAPI.getUserCb(this.state.user.uid, (user) => {
      this.setState({user: user})
    })

    InteractionManager.runAfterInteractions(() => {
      this.removeProfile(profile)
    })
  }

  render() {
    if(this.state.profiles.length > 0)
      return (
        <View style={styles.container}>
          <ScrollView>
          {
            this.state.profiles.map((profile) => {
              return (
                  <View style={styles.match}  key={profile.uid+"-container"}>
                    <TouchableOpacity onPress={() => {this.showProfile(profile)}}
                    key={profile.uid+"-touchable"} >
                      <View style={styles.content} >
                        <View style={styles.headerContainer}>
                          <View style={styles.leftColumn}>
                            <Text style={styles.name}>{profile.name.split(' ')[0]}</Text>
                            <Text style={styles.age}>{this.getAge(profile.birthday)} years old</Text>
                            <Text style={styles.gender}>{profile.gender[0].toUpperCase() + profile.gender.slice(1, profile.gender.length+1)}</Text>
                          </View>
                          <View style={styles.rightColumn}>
                            <TouchableOpacity onPress={() => {this.rejectProfile(profile)}}
                            key={profile.uid+"-remove"} >
                              <Text style={{fontSize: 24, color: 'lightgrey'}}>X</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                        <View style={styles.bioContainer}>
                          <Text style={styles.bio}>{profile.bio}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
              )
            })
          }
          </ScrollView>
        </View>
      );
    else
      return <View></View>
  }
}

const matchHeight = height/3*1.05
const matchWidth =  width/20*19

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    backgroundColor: '#f7fbff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: matchWidth,
    height: matchHeight, 
    shadowColor: '#000000', 
    shadowOffset: {width: 0, height: 0}, 
    shadowRadius: 7, 
    shadowOpacity: 0.3,
    borderWidth: 1,
    borderColor: 'lightgrey',
    borderRadius: 10,
    marginTop: 10,
    backgroundColor: 'white'
  },
  name: {
    color: '#2B2B2B',
    fontSize: 18,
    marginTop: 15,
    textAlign: 'left',
  },
  match: {
    width: width,
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 10,
  },
  bio: {
    flex: 1,
    alignSelf: 'flex-start',
    paddingTop: 10,
    paddingBottom: 30,
    paddingLeft: 20,
    paddingRight: 20,
    fontSize:18,
    color: '#565656',
    textAlign: 'left',
    backgroundColor: 'white',
    //The following limits the shown portion of bio
    //to a max of 4 lines
    lineHeight: (matchHeight/10*6)/5,
  },
  bioContainer: {
    flex: 1,
    borderRadius: 10,
    paddingBottom: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    paddingTop: 5,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 10,
    backgroundColor:'white',
    borderBottomWidth: 1,
    borderColor: 'lightgrey',
    borderRadius: 10,
  },
  leftColumn: {
    alignSelf: 'flex-start',
    width: matchWidth/2,
  },
  rightColumn: {
    width: matchWidth/3,
    alignItems: 'flex-end',
    marginLeft: 10,
    marginRight: 10,
    marginTop: 10,
  },
  name: {
    color: '#2B2B2B',
    fontSize: 24,
    marginTop: 5,
    marginBottom: 1,
    textAlign: 'left',
    fontWeight: 'bold',
    borderRadius: 10,
  },
  age: {
    color: '#2B2B2B',
    textAlign: 'left',
    fontSize: 16,
    marginTop: 2,
    marginBottom: 1,
    color: 'gray',
    borderRadius: 10,
  },
  gender: {
    color: '#2B2B2B',
    textAlign: 'left',
    fontSize: 17,
    marginTop: 2,
    marginBottom: 2,
    color: 'gray',
    borderRadius: 10,
  },
});
