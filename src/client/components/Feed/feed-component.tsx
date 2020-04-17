import React, { Component } from "react";

import WorkerComponent from "./feed-workers-component";
import { OrderComponent } from "./feed-orders-component";
import { RouteComponent } from "./feed-routes-component";
import { StatisticComponent } from "./feed-statistics-component";
import { WarehouseComponent } from "./feed-warehouse-component";

interface Item {
  to: string,
  title: string,
  component?: any
}

interface NavigationProps {
  items: Item[],
  onChoose?: (chooseItem: string) => void,
  checkedIndex?: number
}

interface NavigationState {
  currentItem: string
}

class Navigation extends Component<NavigationProps, NavigationState> {
  state = {
    currentItem: this.props.items[this.props.checkedIndex || 0].to
  }

  constructor(props) {
    super(props);

    if (this.props.items.length == 0) {
      throw new Error("Navigation items is empty!");
    }
  }

  chooseItem = (e) => {
    this.setState({ currentItem: e.currentTarget.to });

    if (this.props.onChoose) {
      this.props.onChoose(e.to);
    }
  }

  render() {
    return (
      <nav className="main-navigation">
      {
        ...this.props.items.map((item: Item) => (
          <NavigationItem key={`${item.title}-nav-item`} checked={this.state.currentItem == item.to} to={item.to} onClick={this.chooseItem}>{item.title}</NavigationItem>
        ))
      }
      </nav>
    );
  }
}

interface NavigationItemProps {
  onClick?: (e: any) => void,
  to: string,
  checked?: boolean
}

class NavigationItem extends Component<NavigationItemProps> {
  handleClick = (e: any) => {
    if (this.props.onClick) {
      let obj = Object.assign({to: this.props.to}, e);
      obj.to = this.props.to;
      this.props.onClick(obj);
    }
  }

  render() {
    return (
      <div className={`main-navigation__item${this.props.checked ? ' checked' : ''}`} onClick={this.handleClick}>{this.props.children}</div>
    );
  }
}

const NAVIGATION_ITEMS: Item[] = [
  { to: 'workers', title: 'workers', component: <WorkerComponent /> },
  { to: 'statistic', title: 'statistic', component: <StatisticComponent /> },
  { to: 'routes', title: 'routes', component: <RouteComponent /> },
  { to: 'orders', title: 'orders', component: <OrderComponent /> },
  { to: 'warehouse', title: 'warehouse', component: <WarehouseComponent /> }
];

interface FeedState {
  checkedNavigationItem: number
}

class Feed extends Component<any, any> {
  state = {
    checkedNavigationItem: 0
  }

  chooseNavigationItem = (item: string) => {
    this.setState({ checkedNavigationItem: NAVIGATION_ITEMS.findIndex(nav_el => nav_el.to == item) });
  }

  render() {
    return (
      <main className="feed">
        <Navigation onChoose={this.chooseNavigationItem} items={NAVIGATION_ITEMS} />
        {
          ...NAVIGATION_ITEMS.map((item: Item, index: number) => (
            this.state.checkedNavigationItem == index
              ? <section key={`${Date.now()}-${item.title}-section`} className={"feed__main-section " + item.to + "-section"}>{item.component || null}</section>
              : undefined
          ))
        }
      </main>
    );
  }
}

export default Feed;
