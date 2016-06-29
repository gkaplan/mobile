import React from 'react';

import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';

import globalStyles from '../globalStyles';

export function FinaliseButton(props) {
  return (
    <View style={[globalStyles.navBarRightContainer, localStyles.outerContainer]}>
      <Text style={[globalStyles.navBarText, localStyles.text]}>
        {props.isFinalised ? 'FINALISED. CANNOT BE EDITED' : 'FINALISE'}
      </Text>
      {props.isFinalised ?
        (
          <Icon
            name="lock"
            style={globalStyles.finalisedLock}
          />
      ) : (
        <TouchableOpacity onPress={props.onPress}>
          <Icon
            name="check-circle"
            style={globalStyles.finaliseButton}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

FinaliseButton.propTypes = {
  isFinalised: React.PropTypes.bool.isRequired,
  onPress: React.PropTypes.func,
};
FinaliseButton.defaultProps = {
  isFinalised: false,
};

const APPBAR_HEIGHT = Platform.OS === 'ios' ? 44 : 56; // Taken from NavigationExperimental
const localStyles = StyleSheet.create({
  outerContainer: {
    height: APPBAR_HEIGHT,
  },
  text: {
    bottom: 12,
  },
});