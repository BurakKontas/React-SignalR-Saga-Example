import React, { useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';
import { v4 as randomUUID } from 'uuid';
import axios from 'axios';

const App: React.FC = () => {
  const [orderStatus, setOrderStatus] = useState('Not Sent');
  const [hubConnection, setHubConnection] = useState<signalR.HubConnection | null>(null);
  const [Order, setOrder] = useState<any>();

  const startOrder = async () => {
    try {
      var data = await startOrderConnection();
      await new Promise(resolve => setTimeout(resolve, 5000));
      var response = await axios.post('https://localhost:7080/Order', data!.order);

      if (response.status.toString().startsWith("2")) {
        console.log('Order placed successfully.');
      } else {
        data?.stop();
        console.error('Failed to place order.');
      }
    } catch (error) {
      data?.stop();
      console.error('Failed to place order:', error);
    }
  }
  const startOrderConnection = async () => {
      try {
        const randomKey = randomUUID();
        const connection = new signalR.HubConnectionBuilder()
          .withUrl("https://localhost:7080/chatHub")
          .configureLogging(signalR.LogLevel.Information)
          .build();

        connection.on(`OrderStatusUpdated-${randomKey}`, (status) => {
          console.log('Status updated:', status);
          setOrderStatus(status);
          if (status === 'Delivered') {
            connection.stop();
            console.log('Connection stopped.');
          }
        });

        await connection.start();
        console.log('Hub connection started.');


        const order = {
          orderId: "1",
          productName: "Laptop",
          quantity: 1,
          connectionId: connection.connectionId!,
          randomKey: randomKey,
        }
        setOrder(order);
        console.log('Connection ID:', order.connectionId);

        return {
          stop: connection.stop,
          randomKey: randomKey, 
          order: order
        }
      } catch (error) {
        console.error('Error creating hub connection:', error);
      }
    };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      backgroundColor: 'black',
    }}>
      <h1>Order: {JSON.stringify(Order, null, 4)}</h1>
      <h1>Order Status: {orderStatus}</h1>
      <button onClick={startOrder}>Create Order</button>
    </div>
  );
};

export default App;
