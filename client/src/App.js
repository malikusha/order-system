import React from "react";
import axios from 'axios';
import { Link } from 'react-router-dom'
import { Menu, Segment, Container, Button, Image, List, Popup, Grid } from 'semantic-ui-react'
import "semantic-ui-css/semantic.min.css"
import "./App.css";

const TIMEOUT = 50 * 1000

class App extends React.Component {
  state = {
    menu: {},
    activeItem: '1',
    cart: JSON.parse(localStorage.getItem('cart_info')) == null ? {} : JSON.parse(localStorage.getItem('cart_info')),
    items: {},
    errorMessage: ''
  }

  async componentDidMount() {
    // TODO: when we have a bigger menu, we can also add a probable timeout handling, in case it takes too long to load the entire menu due to its size
    // for now, we know that menu is short enough, i.e. if it takes longer to load, then we know something is wrong
    try {
      const res = await axios.get("/api/get_menu", {timeout: TIMEOUT})
      const data = res.data
      var new_items = []
      var new_categories = {}
      console.log("data", data)
      data.menu.categories.forEach(category => {
        new_categories[category.id] = {
          name: category.name,
          image: category.image_id,
          items: []
        }
      });
      data.menu.items.forEach(item => {
        new_categories[item.category_id].items.push(item)
        new_items[item.id] = item
      });
      this.setState({ menu: new_categories, items: new_items, errorMessage: '' })
    } catch (err) {
        console.log(err)
        if (err.message.includes('timeout')) {
            this.setState({ errorMessage: "This took too long, something went wrong. Please try again later."})     
        } else {
            this.setState({ errorMessage: "Uh-oh! Something went wrong. Try again. "+err.message})
        }
    } 
  }

  handleItemClick = (key, event) => {
    this.setState({ activeItem: key })
  }

  addToCart = (item_id, e) => {
    var new_cart = this.state.cart
    if (item_id in new_cart) {
      new_cart[item_id].count++
    } else {
      new_cart[item_id] = { count: 1, name: this.state.items[item_id].name, price: this.state.items[item_id].price }
    }
    this.setState({ cart: new_cart })
    console.log(this.state.cart)
  }

  subtractFromCart = (item_id, e) => {
    var new_cart = this.state.cart
    if (new_cart[item_id].count === 1) {
      delete new_cart[item_id];
    } else {
      new_cart[item_id].count--
    }
    this.setState({ cart: new_cart })
  }

  renderCart(cart) {
    var total = 0

    if (cart) {
      localStorage.setItem('cart_info', JSON.stringify(cart));
    }

    return <div><List divided style={{ 'maxWidth': 400, 'minWidth': 200 }}>
      { cart == null ? null :
        Object.keys(cart).map((key) => {
          total = total + cart[key].count * cart[key].price
          return (
            <List.Item key={key}>
              <List.Content>
                <Grid columns="equal">
                  <Grid.Column>
                    <Button onClick={(e) => this.subtractFromCart(key, e)} icon="minus"></Button>
                  </Grid.Column>
                  <Grid.Column>
                    <p style={{ textAlign: "center" }}>{cart[key].count}</p>
                  </Grid.Column>
                  <Grid.Column>
                    <Button onClick={(e) => this.addToCart(key, e)} icon="plus"></Button>
                  </Grid.Column>
                </Grid>
              </List.Content>
              <List.Content style={{ 'fontSize': 20 }}>{cart[key].name}</List.Content>
            </List.Item>
          );
        })
      }
    </List>
      <div>Your total is: ${total}</div>
      {!total ? null : <Link to='/checkout'><Button className="center-div-horizontally" circular color='red' content='Checkout' /></Link>}
    </div>
  }

  renderItemsPerCategory(menu, activeItem) {
    return <Container className="OuterMargin">
      <List divided style={{ 'maxWidth': '60%' }} floated='left' size="massive" verticalAlign='middle'>
        {
          (!Object.keys(menu).length) ? (null) :
            menu[activeItem].items.map((item) => {
              return (
                <List.Item style={{ 'margin': 20 }} key={item.id}>
                  <List.Content floated='right'>
                    <Button onClick={(e) => this.addToCart(item.id, e)}>Add to Cart</Button>
                  </List.Content>
                  <Image alt="" floated='left' className="crop-images" size="small" src={require(`./images/${item.image_id}.jpg`)} />
                  <List.Content floated='left' style={{ 'fontSize': 20 }}>{item.name}</List.Content>
                  <List.Content floated='left' style={{ 'fontSize': 20 }}>${item.price}</List.Content>
                </List.Item>
              );
            })
        }
      </List>
    </Container>
  }

  render() {
    const { menu, activeItem, cart } = this.state

    return (
      <div className="App">
        <div className="OuterMargin">
          <Menu attached='top' tabular>

            {
              Object.keys(menu).map((key) => {
                return (
                  <Menu.Item key={key} name={menu[key].name} active={activeItem === key} onClick={(e) => this.handleItemClick(key, e)}>
                    <Image avatar className="crop-images" style={{ 'fontSize': 30 }} alt="" src={require(`./images/${menu[key].image}.jpg`)} />
                    <List.Content>{menu[key].name}</List.Content>
                  </Menu.Item>
                );
              })
            }

            <Menu.Menu position='right'>
              <Menu.Item>
                <Popup
                  trigger={
                    <Button color='green' icon='shopping cart' content='Your Cart' />
                  }
                  content={

                    this.renderCart(cart)

                  }
                  on='click'
                  position='bottom left'
                />
              </Menu.Item>
            </Menu.Menu>
          </Menu>
          <Segment basic className="ItemsInCategory" >

            {this.renderItemsPerCategory(menu, activeItem)}

          </Segment>
        </div>
      </div>
    );
  }

}

export default App;
