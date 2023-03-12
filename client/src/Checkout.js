import React from "react";
import axios from 'axios';
import "semantic-ui-css/semantic.min.css"
import { Link } from 'react-router-dom'
import { List, Grid, Container, Form, Icon, Message} from 'semantic-ui-react'

const TIMEOUT = 20 * 1000

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
        zip: '',
        errorMessage: '',
        warningMessage: '',
        warningList: [],
        success: ''
    }

    // validate the input
    validateFormInput() {
        const {name, cardNumber, month, year, code, address, state, zip} = this.state
        const allInputs = {name, cardNumber, month, year, code, address, state, zip}
        var inputWrong = false
        var inputErrors = []
        Object.entries(allInputs).forEach(([inputName, inputValue]) => {
            switch ([inputName][0]) {
                case 'name': // cant be empty
                    if (inputValue.length > 0 && inputValue.length < 1200) {
                    } else {
                        inputWrong = true
                        inputErrors.push("Full Name")
                    }
                    break
                case 'cardNumber': // has to be 16-digits 
                    if (inputValue.length !== 16 && parseInt(inputValue) !== NaN) {
                        inputWrong = true 
                        inputErrors.push("Card Number")
                    }
                    break
                case 'month': // has to be 2-digits in range from 01 to 12
                    if (inputValue.length === 2 && parseInt(inputValue) > 0 && parseInt(inputValue) < 13) {
                    } else {
                        inputWrong = true
                        inputErrors.push("Month")
                    }
                    break
                case 'year': // has to be 2-digits 
                    // TODO: currently not checking based on the month and year, so all the past months within current year would not throw an input error
                    if (inputValue.length === 2 && parseInt(inputValue) > 22 && parseInt(inputValue) !== NaN) {
                    } else {
                        inputWrong = true
                        inputErrors.push("Year")
                    }
                    break
                case 'code': // has to be 3-digits
                    if (inputValue.length !== 3 && parseInt(inputValue) !== NaN) {
                        inputWrong = true
                        inputErrors.push("Code")
                    }
                    break
                case 'address': // cant be empty
                    if (!inputValue.length) {
                        inputWrong = true
                        inputErrors.push("Address")
                    }
                    break
                case 'state': // cant be empty
                    // TODO: replace with the dropdown for states
                    if (!inputValue.length) {
                        inputWrong = true
                        inputErrors.push("State")
                    }
                    break
                case 'zip': // has to be 5-digits, US zip codes only, support other countires in the future
                    if (inputValue.length !== 5 && parseInt(inputValue) !== NaN) {
                        inputWrong = true
                        inputErrors.push("Zip code")
                    }
                    break
                default:
                  console.log("Hmm, that shouldnt happen");
            }
        });
        this.setState({warningList: inputErrors, warningMessage: "Please check these fileds, they have a wrong format:"})
        return !inputWrong
    }

    handleSubmit = async () => {
        const {cart, name, cardNumber, month, year, code, address, state, zip} = this.state
        if (!this.validateFormInput()) {
            return
        }
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
            return { item_id: parseInt(item_id), count: cart[item_id].count }
        })
        const orderInfo = {
            paymentInfo: paymentObject,
            orderTotal: total,
            items: itemsList
        }

        try {
            const res = await axios.post("/api/submit_order", {
                order_info: orderInfo,
                timeout: TIMEOUT
            })
            if (res.status === 200) {
                this.setState({
                    success: 'Your order will be ready for pickup in 10 minutes!', 
                    errorMessage: '', 
                    name: '', cardNumber: '', month: '', year: '', code: '', address: '', state: '', zip: ''
                })
                localStorage.setItem('cart_info', JSON.stringify({}));
            }
        } catch (err) {
            if (err.message.includes('timeout')) {
                this.setState({ success:'', errorMessage: "This took too long, something went wrong. Please try again later."})     
            } else {
                this.setState({ success:'', errorMessage: "Uh-oh! Something went wrong. Try again. "+err.message})
            }
        } 
    }

    handleChange = (e, { name, value }) => {
        this.setState({ [name]: value })
    }

    renderCartItems(cart, success) {
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
            <Link to='/'><Icon name="left arrow" />Go back to {!success.length ? "modify your cart" : "make another order"}</Link>
        </div>
    }

    render() {
        const { success, errorMessage, cart, name, cardNumber, month, year, code, address, state, zip, warningList, warningMessage } = this.state
        return (
            <Container style={{ "marginTop": 70 }}>
                <Grid columns={2} divided>
                    <Grid.Row stretched>
                        <Grid.Column >
                            <div>{this.renderCartItems(cart, success)}</div>
                        </Grid.Column>
                        <Grid.Column >
                            <Form warning success error>
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
                                <Message
                                    warning
                                    header={warningMessage}
                                    list={warningList}
                                    hidden={!warningList.length}
                                />
                                <Message
                                    success
                                    header='Payment Completed'
                                    content={success}
                                    hidden={!success.length}
                                />
                                <Message
                                    error
                                    header=':('
                                    content={errorMessage}
                                    hidden={!errorMessage.length}
                                />
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
