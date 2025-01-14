/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import {
  ArrowForwardIcon,
  NativeBaseProvider,
  Box,
  Image,
  Center,
  Input,
  Modal,
  Heading,
  VStack,
  Alert,
} from 'native-base';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
  ToastAndroid,
} from 'react-native';
import axios from 'axios';
import {HStack, Button} from 'native-base';
import React, {useState, useEffect, useRef} from 'react';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GetLocation from 'react-native-get-location';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import OTPTextInput from 'react-native-otp-textinput';

import {openDatabase} from 'react-native-sqlite-storage';

const db = openDatabase({
  name: 'rn_sqlite',
});
const POD = ({route}) => {
  // console.log("========post rd params=======", route.params);
  const navigation = useNavigation();
  const [name, setName] = useState(route.params.contactPersonName);
  const [inputOtp, setInputOtp] = useState('');
  const [mobileNumber, setMobileNumber] = useState(route.params.phone);
  const [showModal11, setShowModal11] = useState(false);
  const [modalVisible11, setModalVisible11] = useState(false);
  const [DropDownValue11, setDropDownValue11] = useState(null);
  const [PartialCloseData, setPartialCloseData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState(0);
  const [runsheetNo, setRunsheetNo] = useState('');
  const [newaccepted, setnewAccepted] = useState(route.params.accepted);
  const [newrejected, setnewRejected] = useState(route.params.rejected);
  const [newNotPicked, setNewNotPicked] = useState(route.params.notPicked);
  const [acceptedArray, setAcceptedArray] = useState([]);
  const [rejectedArray, setRejectedArray] = useState([]);
  const [notPickedArray, setNotPickedArray] = useState([]);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    const interval = setInterval(() => {
      if (timer > 0) {
        setTimer(timer - 1);
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [timer]);

  const DisplayData11 = async () => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM PartialCloseReasons', [], (tx1, results) => {
        let temp = [];
        // console.log(results.rows.length);
        for (let i = 0; i < results.rows.length; ++i) {
          temp.push(results.rows.item(i));
        }
        // console.log('Data from Local Database partialClosure : \n ', temp);
        setPartialCloseData(temp);
        // console.log('Table6 DB OK:', temp.length);
      });
    });
  };
  useEffect(() => {
    DisplayData11();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      displayDataSPScan();
    });
    return unsubscribe;
  }, [navigation]);

  const displayDataSPScan = async () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Pickup" AND consignorCode=?  AND status="accepted"',
        [route.params.consignorCode],
        (tx1, results) => {
          setnewAccepted(results.rows.length);
          let temp = [];
          for (let i = 0; i < results.rows.length; ++i) {
            temp.push(results.rows.item(i).clientShipmentReferenceNumber);
          }
          setAcceptedArray(temp);
        },
      );
    });
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Pickup" AND consignorCode=? AND status is NULL',
        [route.params.consignorCode],
        (tx1, results) => {
          setNewNotPicked(results.rows.length);
          let temp = [];
          for (let i = 0; i < results.rows.length; ++i) {
            temp.push(results.rows.item(i).clientShipmentReferenceNumber);
          }
          setNotPickedArray(temp);
        },
      );
    });

    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Pickup" AND consignorCode=? AND status="rejected"',
        [route.params.consignorCode],
        (tx1, results) => {
          setnewRejected(results.rows.length);
          let temp = [];
          for (let i = 0; i < results.rows.length; ++i) {
            temp.push(results.rows.item(i).clientShipmentReferenceNumber);
          }
          setRejectedArray(temp);
        },
      );
    });
  };

  const submitForm11 = () => {
    // console.log('========postRD Data==========', {
    //   runsheetNo: runsheetNo,
    //   expected: route.params.Forward,
    //   accepted: route.params.accepted,
    //   rejected: route.params.rejected,
    //   nothandedOver: newNotPicked,
    //   feUserID: route.params.userId,
    //   receivingTime: new Date().valueOf(),
    //   latitude: route.params.latitude,
    //   longitude: route.params.longitude,
    //   receiverMobileNo: mobileNumber,
    //   receiverName: name,
    //   consignorAction: 'Seller Pickup',
    //   consignorCode: route.params.consignorCode,
    //   acceptedShipments: acceptedArray,
    //   rejectedShipments: rejectedArray,
    //   nothandedOverShipments: notPickedArray,
    // });

    try {
      axios
        .post('https://bkedtest.logistiex.com/SellerMainScreen/postRD', {
          runsheetNo: runsheetNo,
          expected: route.params.Forward,
          accepted: route.params.accepted,
          rejected: route.params.rejected,
          nothandedOver: newNotPicked,
          feUserID: route.params.userId,
          receivingTime: new Date().valueOf(),
          latitude: route.params.latitude,
          longitude: route.params.longitude,
          receiverMobileNo: mobileNumber,
          receiverName: name,
          consignorAction: 'Seller Pickup',
          consignorCode: route.params.consignorCode,
          acceptedShipments: acceptedArray,
          rejectedShipments: rejectedArray,
          nothandedOverShipments: notPickedArray,
        })
        .then(function (response) {
          console.log('POST RD Data Submitted', response.data);
          alert('Your Data has submitted');
        })
        .catch(function (error) {
          console.log(error.response.data);
          alert(error.response.data.msg);
        });
    }
    catch (error) {
      console.log("===try catch post rd error====", error);
    }
  };

  const sendSmsOtp = async () => {
    await axios
      .post('https://bkedtest.logistiex.com/SMS/msg', {
        mobileNumber: mobileNumber,
      })
      .then(setShowModal11(true))
      .catch(err => console.log('OTP not send'));
  };

  function handleButtonPress11(item) {
    // if(item=='Partial Dispatch'){
    //   navigation.navigate('Dispatch');
    // }
    setDropDownValue11(item);
    // setModalVisible11(false);
  }

  function validateOTP() {
    axios
      .post('https://bkedtest.logistiex.com/SMS/OTPValidate', {
        mobileNumber: mobileNumber,
        otp: inputOtp,
      })
      .then(response => {
        if (response.data.return) {
          // alert("OTP Submitted Successfully")
          setMessage(1);
          submitForm11();
          setInputOtp('');
          setShowModal11(false);

          db.transaction(tx => {
            tx.executeSql(
              'UPDATE SellerMainScreenDetails SET status="notPicked", rejectionReasonL1=?, eventTime=?, latitude=?, longitude=? WHERE shipmentAction="Seller Pickup" AND status IS Null And consignorCode=?',
              [
                route.params.DropDownValue,
                new Date().valueOf(),
                route.params.latitude,
                route.params.longitude,
                route.params.consignorCode,
              ],
              (tx1, results) => {
                if (results.rowsAffected > 0) {
                  ToastAndroid.show(
                    'Partial Closed Successfully',
                    ToastAndroid.SHORT,
                  );
                } else {
                  console.log('failed to add notPicked item locally');
                }
              },
            );
          });
        } else {
          alert('Invalid OTP, please try again !!');
          setMessage(2);
        }
      })
      .catch(error => {
        // alert('Invalid OTP, please try again !!');
        setMessage(2);
        console.log(error);
      });
  }

  const displayData = async () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM SellerMainScreenDetails where shipmentAction="Seller Pickup" AND consignorCode=? ',
        [route.params.consignorCode],
        (tx1, results) => {
          // ToastAndroid.show("Loading...", ToastAndroid.SHORT);
          let temp = [];
          console.log(results.rows.length);
          for (let i = 0; i < results.rows.length; ++i) {
            temp.push(results.rows.item(i));
          }
          setRunsheetNo(temp[0].runSheetNumber);
        },
      );
    });
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      displayData();
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <NativeBaseProvider>
      <Modal
        w="100%"
        isOpen={showModal11}
        onClose={() => {
          setShowModal11(false), setTimer(60);
        }}>
        <Modal.Content w="100%" bg={'#eee'}>
          <Modal.CloseButton />
          <Modal.Body w="100%">
            <Modal.Header>Enter the OTP</Modal.Header>
            <OTPTextInput
              ref={e => (otpInput = e)}
              inputCount={6}
              handleTextChange={e => setInputOtp(e)}
            />
            <Box flexDir="row" justifyContent="space-between" mt={3}>
              {timer ? (
                <Button w="40%" bg="gray.500">
                  <Text style={{color: 'white'}}>{timer}s</Text>
                </Button>
              ) : (
                <Button
                  w="40%"
                  bg="gray.500"
                  onPress={() => {
                    sendSmsOtp();
                    setTimer(60);
                  }}>
                  Resend
                </Button>
              )}
              <Button
                w="40%"
                bg="#004aad"
                onPress={() => {
                  validateOTP();
                }}>
                Submit
              </Button>
            </Box>
          </Modal.Body>
        </Modal.Content>
      </Modal>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <Modal.Content backgroundColor={message === 1 ? '#dcfce7' : '#fee2e2'}>
          <Modal.CloseButton />
          <Modal.Body>
            <Alert w="100%" status={message === 1 ? 'success' : 'error'}>
              <VStack space={1} flexShrink={1} w="100%" alignItems="center">
                <Alert.Icon size="4xl" />
                <Text my={3} fontSize="md" fontWeight="medium">
                  {message === 1
                    ? 'OTP Submitted Successfully'
                    : 'Invalid OTP, please try again !!'}
                </Text>
              </VStack>
            </Alert>
          </Modal.Body>
        </Modal.Content>
      </Modal>
      <Modal
        isOpen={modalVisible11}
        onClose={() => setModalVisible11(false)}
        size="lg">
        <Modal.Content maxWidth="350">
          <Modal.CloseButton />
          <Modal.Header>Partial Close Reason Code</Modal.Header>
          <Modal.Body>
            {PartialCloseData &&
              PartialCloseData.map((d, index) => (
                <Button
                  key={d.reasonID}
                  flex="1"
                  mt={2}
                  marginBottom={1.5}
                  marginTop={1.5}
                  style={{
                    backgroundColor:
                      d.reasonName === DropDownValue11 ? '#6666FF' : '#C8C8C8',
                  }}
                  title={d.reasonName}
                  onPress={() => handleButtonPress11(d.reasonName)}>
                  <Text
                    style={{
                      color:
                        d.reasonName == DropDownValue11 ? 'white' : 'black',
                    }}>
                    {d.reasonName}
                  </Text>
                </Button>
              ))}
            <Button
              flex="1"
              mt={2}
              bg="#004aad"
              marginBottom={1.5}
              marginTop={1.5}
              onPress={() => setModalVisible11(false)}>
              Submit
            </Button>
          </Modal.Body>
        </Modal.Content>
      </Modal>
      <View style={{backgroundColor: 'white', flex: 1, paddingTop: 30}}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Center>
            <View
              style={{
                width: '90%',
                flexDirection: 'row',
                justifyContent: 'space-between',
                borderWidth: 1,
                borderBottomWidth: 0,
                borderColor: 'lightgray',
                borderTopLeftRadius: 5,
                borderTopRightRadius: 5,
                padding: 10,
              }}>
              <Text style={{fontSize: 18, fontWeight: '500'}}>Expected</Text>
              <Text style={{fontSize: 18, fontWeight: '500'}}>
                {route.params.Forward}
              </Text>
            </View>
            <View
              style={{
                width: '90%',
                flexDirection: 'row',
                justifyContent: 'space-between',
                borderWidth: 1,
                borderBottomWidth: 0,
                borderColor: 'lightgray',
                padding: 10,
              }}>
              <Text style={{fontSize: 18, fontWeight: '500'}}>Accepted</Text>
              <Text style={{fontSize: 18, fontWeight: '500'}}>
                {newaccepted}
              </Text>
            </View>
            <View
              style={{
                width: '90%',
                flexDirection: 'row',
                justifyContent: 'space-between',
                borderWidth: 1,
                borderBottomWidth: 0,
                borderColor: 'lightgray',
                padding: 10,
              }}>
              <Text style={{fontSize: 18, fontWeight: '500'}}>Rejected</Text>
              <Text style={{fontSize: 18, fontWeight: '500'}}>
                {newrejected}
              </Text>
            </View>
            <View
              style={{
                width: '90%',
                flexDirection: 'row',
                justifyContent: 'space-between',
                borderWidth: 1,
                borderColor: 'lightgray',
                borderBottomLeftRadius: 5,
                borderBottomRightRadius: 5,
                padding: 10,
              }}>
              <Text style={{fontSize: 18, fontWeight: '500'}}>Not Picked</Text>
              <Text style={{fontSize: 18, fontWeight: '500'}}>
                {newNotPicked}
              </Text>
            </View>
          </Center>
          <Center>
            <Input
              mx="3"
              mt={4}
              placeholder="Receiver Name"
              w="90%"
              bg="gray.200"
              size="lg"
              value={name}
              onChangeText={e => setName(e)}
            />
            <Input
              mx="3"
              my={4}
              placeholder="Mobile Number"
              w="90%"
              bg="gray.200"
              size="lg"
              value={mobileNumber}
              onChangeText={e => setMobileNumber(e)}
            />
            <Button
              w="90%"
              size="lg"
              style={{backgroundColor: '#004aad', color: '#fff'}}
              title="Submit"
              onPress={() => sendSmsOtp()}>
              Submit
            </Button>
            {/* <Button w="90%" mt={2} size="lg" style={{backgroundColor:'#004aad', color:'#fff'}}  title="Submit"  onPress={() => setModalVisible11(true)} >Partial Close</Button> */}
          </Center>
          <Center>
            <Image
              style={{width: 150, height: 150}}
              source={require('../../assets/image.png')}
              alt={'Logo Image'}
            />
          </Center>
        </ScrollView>
      </View>
    </NativeBaseProvider>
  );
};

export default POD;

export const styles = StyleSheet.create({
  normal: {
    fontFamily: 'open sans',
    fontWeight: 'normal',
    color: '#eee',
    marginTop: 20,
    marginLeft: 10,
    marginRight: 10,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#eee',
    width: 'auto',
    borderRadius: 0,
  },

  text: {
    paddingLeft: 20,
    color: '#000',
    fontWeight: 'normal',
    fontSize: 18,
  },
  container: {
    flex: 1,
    fontFamily: 'open sans',
    fontWeight: 'normal',
    color: '#eee',
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 'auto',
    borderWidth: 1,
    borderColor: '#eee',
  },

  containerText: {
    paddingLeft: 30,
    color: '#000',
    fontSize: 15,
  },
  otp: {
    backgroundColor: '#004aad',
    color: '#000',
    marginTop: 5,
    borderRadius: 10,
  },
});
