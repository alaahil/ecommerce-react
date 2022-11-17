import React, { useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { View, TouchableOpacity, LayoutAnimation } from 'react-native';
import { Icon } from 'react-native-elements';
import CategoryTreeList from './CategoryTreeList';
import { Text } from '../common';
import { setCurrentCategory, resetFilters } from '../../actions/index';
import { NAVIGATION_CATEGORY_PATH } from '../../navigation/routes';
import NavigationService from '../../navigation/NavigationService';
import { ThemeContext } from '../../theme';

const CategoryTreeListItem = props => {
  const [expanded, setExpanded] = useState(false);
  const dispatch = useDispatch();
  const theme = useContext(ThemeContext);

  useEffect(() => {
    const switchAnimation = {
      duration: 150,
      update: {
        type: LayoutAnimation.Types.linear,
        property: LayoutAnimation.Properties.opacity,
      },
    };
    LayoutAnimation.configureNext(switchAnimation);
  });

  const onExpandPress = () => setExpanded(!expanded);

  const onRowPress = () => {
    const { category } = props;

    dispatch(resetFilters());
    dispatch(setCurrentCategory({ category }));
    NavigationService.navigate(NAVIGATION_CATEGORY_PATH, {
      title: category.name,
    });
  };

  const renderExpandButton = () => {
    if (props.category?.children_data?.length) {
      const icon = expanded ? 'ios-arrow-dropdown' : 'ios-arrow-dropright';
      return (
        <TouchableOpacity onPress={onExpandPress}>
          <Icon
            iconStyle={styles.dropIcon(theme)}
            size={20}
            name={icon}
            type="ionicon"
            color="#ffff"
          />
        </TouchableOpacity>
      );
    }
  };

  const renderItem = () => {
    const { category } = props;
    const titleStyle = {
      paddingLeft: 10 * category.level,
      color: '#fff',
    };

    return (
      <View
        style={{
          backgroundColor: '#8BC63E',
        }}>
        <TouchableOpacity onPress={onRowPress} style={styles.rowStyles(theme)}>
          <Text type="heading" style={titleStyle}>
            {category.name}
          </Text>
          {renderExpandButton()}
        </TouchableOpacity>
      </View>
    );
  };

  const renderChildren = () => {
    if (expanded) {
      return (
        <View style={{ backgroundColor: '#8BC63E' }}>
          <CategoryTreeList categories={props.category?.children_data} />
        </View>
      );
    }
  };

  return (
    <View
      style={{
        backgroundColor: '#8BC63E',
        paddingVertical: 20,
        paddingHorizontal: 12,
        flex: 1,
        justifyContent: 'center',
      }}>
      {renderItem()}
      {renderChildren()}
    </View>
  );
};

const styles = {
  rowStyles: theme => ({
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    // borderBottomWidth: 1,
    // borderColor: theme.colors.border,
    // paddingVertical: theme.spacing.large,
    backgroundColor: '#8BC63E',
    // marginTop: 20,
  }),
  dropIcon: theme => ({
    // height: 24,
    // padding: 2,
    // paddingRight: theme.spacing.large,
    // backgroundColor: '#8BC63E',
    // marginTop: 20,
    // flex: 1,
    // paddingVertical: theme.spacing.large,
  }),
};

export default CategoryTreeListItem;
