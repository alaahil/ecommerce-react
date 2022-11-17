import { NavigationActions, StackActions } from 'react-navigation';

let navigator;

function setTopLevelNavigator(navigatorRef) {
  navigator = navigatorRef;
}

function navigate(routeName, params) {
  navigator.dispatch(
    NavigationActions.navigate({
      routeName,
      params,
    })
  );
}



function goBack() {
  //navigator._navigation.goBack();
  navigator.dispatch(NavigationActions.back());
}

function dispatch(params) {
  //navigator._navigation.goBack();
  navigator.dispatch(params);
}

// add other navigation functions that you need and export them

export default {
  goBack,
  navigate,
  dispatch,
  setTopLevelNavigator,
};
