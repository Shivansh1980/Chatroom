import {React, useEffect, useState} from 'react'
import { Grid, Container, Card, CardContent, Button} from '@material-ui/core'
import { answerStyles } from '../styles/ChatStyles'
import { CircularProgress } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';

export default function AnswerBox(props) {
    const message_api = props.message_api;
    let [status, setStatus] = useState("Please Wait While, We Fetch Messages")
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const client = message_api.get_client();
    const style = makeStyles(answerStyles);
    const classes = style()

    useEffect(() => {
        client.send(JSON.stringify({
            'command': 'get_messages_having_thread',
            'username': message_api.get_username(),
            'roomname':message_api.get_roomname()
        }))
        client.onmessage = (e) => {
            const data = JSON.parse(e.data);
            if (data.type == 'thread_messages') {
                console.log(data);
                if (data.status == true) {
                    setMessages(data.messages);
                    setLoading(false);
                }
                else {
                    setStatus(data.message);
                    setLoading(false);
                }
            }
        }
    }, []);

    const message_grids = [];
    for (let message of messages) {
        var message_layout =
            <Grid item>
                <Card id={"message_"+message.id}>
                    <CardContent>
                        {message.message}
                    </CardContent>
                </Card>
            </Grid>
        message_grids.push(message_layout);
    }
    if (message_grids.length == 0) {
        message_grids.push(
            <Grid item className={classes.items}>
                <Card id={"message"}>
                    <CardContent>
                        <p>
                            No Questions has Been Answered Till Yet
                        </p>
                    </CardContent>
                </Card>
            </Grid>
        )
    }

    if (loading) {
        return (
            <div className="loading">
                <h3>{status}</h3>
                <div>
                    <CircularProgress />
                </div>
            </div>
        )
    }
    else {
        return (
            <Container className={classes.root}>
                <div className={classes.center}>
                    <Button className={classes.button} variant="contained" color="secondary" onClick={props.go_to_chatroom}>
                        Go To Chatroom
                    </Button>
                    <h3>These Messages Has Been Threaded in Chatrooom</h3>
                </div>
                <Grid container spacing={2}>
                    {message_grids}
                </Grid>
            </Container>
        )
    }
}
