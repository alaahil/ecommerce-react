import React from 'react';
import {
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';
import { magento } from '../../magento';
import CategoryTreeListItem from './CategoryTreeListItem';
import NavigationService from '../../navigation/NavigationService';
import {
  NAVIGATION_EMIRATES_SELECTION_SCREEN,
  NAVIGATION_LOGIN_PATH,
} from '../../navigation/routes';
import { connect } from 'react-redux';
import { updateCheckoutUI } from '../../actions';

const CategoryTreeList = ({
  categories,
  refreshControl,
  isParentList = false,
  emirates,
}) => {
  const renderItem = category => {
    return <CategoryTreeListItem category={category.item} expanded={false} />;
  };

  const renderListFooter = () => {
    if (!isParentList) {
      return null;
    }
    return (
      <>
        <TouchableOpacity
          style={styles.selectedCityContainer}
          onPress={() =>
            NavigationService.navigate(NAVIGATION_EMIRATES_SELECTION_SCREEN, {})
          }>
          <Text style={styles.selectedEmiratesLabel}>Selected Emirates</Text>
          <Text style={styles.selectedEmiratesValue}>{emirates}</Text>
        </TouchableOpacity>
        {!magento.isCustomerLogin() && (
          <TouchableOpacity
            style={styles.loginContainer}
            onPress={() =>
              NavigationService.navigate(NAVIGATION_LOGIN_PATH, {})
            }>
            <Text style={styles.loginTextStyle}>Login</Text>
          </TouchableOpacity>
        )}
      </>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        refreshControl={refreshControl}
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        ListFooterComponent={renderListFooter}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loginContainer: {
    width: '90%',
    // borderBottomWidth: 1,
    // borderTopWidth: 1,
    borderColor: '#8BC63E',
    paddingVertical: 15,
    marginTop: 25,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'center',
  },
  loginTextStyle: {
    fontSize: 22,
    color: '#8BC63E',
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  selectedCityContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderColor: 'grey',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  selectedEmiratesLabel: {
    fontSize: 16,
    color: 'grey',
    alignSelf: 'center',
  },
  selectedEmiratesValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8BC63E',
    alignSelf: 'center',
  },
});

CategoryTreeList.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.object),
  refreshControl: PropTypes.element,
};

CategoryTreeList.defaultProps = {
  refreshControl: <></>,
};

const mapStateToProps = ({ account }) => {
  return { emirates: account.store.emirates };
};

export default connect(mapStateToProps, { updateCheckoutUI })(CategoryTreeList);
