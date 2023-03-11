import React from "react";
import "semantic-ui-css/semantic.min.css"
import { Link } from 'react-router-dom'
import { Button, List, Grid, Container, Form, Icon } from 'semantic-ui-react'

class Checkout extends React.Component {

    state = {
        cart: JSON.parse(localStorage.getItem('cart_info')),
        orderState: null
    }

    submitOrder(name, cardNumber, month, year, code, address, state, zip) {
        const cart = this.state.cart
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
        const itemsList = Object.keys(cart).map((key) => {
            total = total + cart[key].count * cart[key].price
            return { key: cart[key].count }
        })
        const data = {
            paymentInfo: paymentObject,
            orderTotal: total,
            items: itemsList
        }
        console.log("total:", total, itemsList)
        fetch("/api/submit_order", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then((res) => res.json())
            .then((resData) => {
                console.log(resData)
                // TODO: Update this.state.orderState and display the message
            });
    }

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
        const { cart } = this.state
        return (
            <Container style={{ "marginTop": 70 }}>
                <Grid columns={2} divided>
                    <Grid.Row stretched>
                        <Grid.Column >
                            <div>{this.renderCartItems(cart)}</div>
                        </Grid.Column>
                        <Grid.Column >
                            <Form>
                                <Form.Group widths={2}>
                                    <Form.Input label='Full Name' placeholder='Name on Card' />
                                    <Form.Input label='Card Number' placeholder='Card Number' />
                                    <Form.Input label='Month' placeholder='MM' width={3} />
                                    <Form.Input label='Year' placeholder='YY' width={3} />
                                    <Form.Input label='Code' placeholder='CVV' width={3} />
                                </Form.Group>
                                <Form.Group widths={2}>
                                    <Form.Input label='Billing Address' placeholder='Address' />
                                    <Form.Input label='State' placeholder='CA' width={3} />
                                    <Form.Input label='Zip code' placeholder='e.g. 94103' width={4} />
                                </Form.Group>
                                <Button color="blue" type='submit'>Submit</Button>
                            </Form>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Container>
        );
    }

}

export default Checkout;
