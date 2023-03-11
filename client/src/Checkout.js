import React from "react";
import axios from 'axios';
import "semantic-ui-css/semantic.min.css"
import { Link } from 'react-router-dom'
import { List, Grid, Container, Form, Icon } from 'semantic-ui-react'

class Checkout extends React.Component {

    state = {
        cart: JSON.parse(localStorage.getItem('cart_info')),
        orderState: null,
        name: '', 
        cardNumber: '',
        month: '', 
        year: '', 
        code: '', 
        address: '', 
        state: '', 
        zip: ''
    }

    handleSubmit = () => {
        const {cart, name, cardNumber, month, year, code, address, state, zip} = this.state
        const paymentObject = {
            name: name,
            cardNumber: cardNumber,
            expiration_date: [month, year],
            code: code,
            address: address,
            state: state,
            zip: zip
        }
        var total = 0
        const itemsList = Object.keys(cart).map((item_id) => {
            total = total + cart[item_id].count * cart[item_id].price
            return { item_id: item_id, count: cart[item_id].count }
        })
        const orderInfo = {
            paymentInfo: paymentObject,
            orderTotal: total,
            items: itemsList
        }
        console.log("total:", total, orderInfo)
        axios.post("/api/submit_order", {
            order_info: orderInfo
        }).then((res) => res.json())
            .then((resData) => {
                console.log(resData)
                // TODO: Update this.state.orderState and display the message
                this.setState({ name: '', cardNumber: '', month: '', year: '', code: '', address: '', state: '', zip: '' })
            });
    }

    handleChange = (e, { name, value }) => this.setState({ [name]: value })

    renderCartItems(cart) {
        var total = 0

        return <div>
            <List style={{ 'maxWidth': 400, 'minWidth': 200 }}>
                {
                    Object.keys(cart).map((key) => {
                        total = total + cart[key].count * cart[key].price
                        return (
                            <List.Item key={key}>
                                <List.Content style={{ 'fontSize': 20 }}>{cart[key].count}x{cart[key].name}</List.Content>
                            </List.Item>
                        );
                    })
                }
            </List>
            <div style={{ 'fontSize': 40, "marginBottom": 20 }}>Your total is: ${total}</div>
            <Link to='/'><Icon name="left arrow" />Go back to modify your cart</Link>
        </div>
    }

    render() {
        const { cart, name, cardNumber, month, year, code, address, state, zip } = this.state
        return (
            <Container style={{ "marginTop": 70 }}>
                <Grid columns={2} divided>
                    <Grid.Row stretched>
                        <Grid.Column >
                            <div>{this.renderCartItems(cart)}</div>
                        </Grid.Column>
                        <Grid.Column >
                            <Form>
                                <Form.Group>
                                    <Form.Input 
                                        label='Full Name' placeholder='Name on Card'
                                        name='name'
                                        value={name}
                                        onChange={this.handleChange}/>
                                    <Form.Input 
                                        label='Card Number' placeholder='Card Number'
                                        name='cardNumber'
                                        value={cardNumber}
                                        onChange={this.handleChange}/>
                                    <Form.Input 
                                        label='Month' placeholder='MM' width={3}
                                        name='month'
                                        value={month}
                                        onChange={this.handleChange}/>
                                    <Form.Input 
                                        label='Year' placeholder='YY' width={3}
                                        name='year'
                                        value={year}
                                        onChange={this.handleChange}/>
                                    <Form.Input 
                                        label='Code' placeholder='CVV' width={3}
                                        name='code'
                                        value={code}
                                        onChange={this.handleChange}/>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Input 
                                        label='Billing Address' placeholder='Address'
                                        name='address'
                                        value={address}
                                        onChange={this.handleChange}/>
                                    <Form.Input 
                                        label='State' placeholder='CA' width={3}
                                        name='state'
                                        value={state}
                                        onChange={this.handleChange}/>
                                    <Form.Input 
                                        label='Zip code' placeholder='e.g. 94103' width={4}
                                        name='zip'
                                        value={zip} 
                                        onChange={this.handleChange}/>
                                </Form.Group>
                                <Form.Button onClick={this.handleSubmit} content='Submit' color="blue"/>
                            </Form>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Container>
        );
    }

}

export default Checkout;
