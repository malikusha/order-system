import React from "react";
import { Input, Menu, Segment, Container, Button, Image, List } from 'semantic-ui-react'
import "semantic-ui-css/semantic.min.css"
import "./App.css";


class App extends React.Component {
  state = {
    menu: {},
    activeItem: '1'
  }

  async componentDidMount(){
    fetch("/api/get_menu")
      .then((res) => res.json())
      .then((data) => {
        var new_categories = {}
        data.menu.categories.forEach(category => {
          new_categories[category.id] = {
            name: category.name,
            image: category.image_id,
            items: []
          }
        });
        data.menu.items.forEach(item => {
          new_categories[item.category_id].items.push(item)
        });
        this.setState({menu: new_categories})
        console.log(new_categories)
      });
  }

  handleItemClick = (key, event) => {
    this.setState({ activeItem: key })
  }
  
  render() {
    const {menu, activeItem} = this.state

    const itemsList = (
      <Container className="OuterMargin">
        <List divided floated='left' size="massive" verticalAlign='middle'>
          { 
            (!Object.keys(menu).length) ? (null) :
            menu[activeItem].items.map((item) => {
              return (
                <List.Item style={{'margin':20}} key={item.id}>
                  <List.Content floated='right'>
                    <Button>Add to Cart</Button>
                  </List.Content>
                  <Image alt="" floated='left' className="crop-images" size="small" src={require(`./images/${item.image_id}.jpg`)} />
                  <List.Content floated='left'>{item.name}</List.Content>
                  <List.Content floated='left'>${item.price}</List.Content>
                </List.Item>
              );
            }) 
          }
        </List>
      </Container>
    ) 

    return (
      <div className="App">
        <div className="OuterMargin">
          <Menu attached='top' tabular>
            { 
              Object.keys(menu).map((key, index) => {
                return (
                  <Menu.Item key={key} name={menu[key].name} active={activeItem === key} onClick={(e) => this.handleItemClick(key,e)}>
                    <Image avatar className="crop-images" style={{'font-size':30}}  alt="" src={require(`./images/${menu[key].image}.jpg`)} />
                    <List.Content floated='bottom'>{menu[key].name}</List.Content>
                  </Menu.Item>
                );
              }) 
            }
            <Menu.Menu position='right'>
              <Menu.Item>
                <Input
                  transparent
                  icon={{ name: 'search', link: true }}
                  placeholder='Search items...'
                />
              </Menu.Item>
            </Menu.Menu>
          </Menu>
          {(!Object.keys(menu).length) 
            ? (<Segment loading>
                <Image src='https://react.semantic-ui.com/images/wireframe/paragraph.png' />
              </Segment>) 
            : (<Segment basic className="ItemsInCategory" >
                {itemsList}
              </Segment>)
          }
        </div>
      </div>
    );
  }

}

export default App;
