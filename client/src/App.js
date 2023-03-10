import React from "react";
import "./App.css";
// import { Container, Header, Segment, Icon, Grid, Image, Button, Divider } from 'semantic-ui-react'


class App extends React.Component {
  state = {
    menu: null,
    categories: {}
  }

  async componentDidMount(){
    fetch("/api/get_menu")
      .then((res) => res.json())
      .then((data) => {
        console.log(data.menu)
        this.setState({menu: data.menu})
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
        this.setState({categories: new_categories})
        console.log(new_categories)
      });
  }
  
  render() {
    const {menu, categories} = this.state
    return (
      <div className="App">
        <header className="App-header">
        <div>
          { Object.keys(categories).map((key, index) => {
            return (
              <div>
                <h2>{categories[key].name}</h2>
                <img src={require(`./images/${categories[key].image}.jpg`)} width="80" height="80" />
              </div>
            );
          }) }
        </div>
        </header>
      </div>
    );
  }

}

export default App;
