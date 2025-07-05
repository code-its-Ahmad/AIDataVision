import { useEffect, useRef, useState } from 'react';
import { WebSocketMessage } from '../types/dashboard';

export function useWebSocket(url: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const websocket = useRef<WebSocket | null>(null);
  const messageHandlers = useRef<Map<string, (data: any) => void>>(new Map());

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const connect = () => {
      try {
        websocket.current = new WebSocket(wsUrl);
        
        websocket.current.onopen = () => {
          setIsConnected(true);
          setError(null);
          console.log('WebSocket connected');
        };
        
        websocket.current.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            setLastMessage(message);
            
            // Call specific handler if registered
            const handler = messageHandlers.current.get(message.type);
            if (handler) {
              handler(message.data);
            }
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
          }
        };
        
        websocket.current.onerror = (event) => {
          setError('WebSocket connection error');
          console.error('WebSocket error:', event);
        };
        
        websocket.current.onclose = () => {
          setIsConnected(false);
          console.log('WebSocket disconnected');
          
          // Attempt to reconnect after 3 seconds
          setTimeout(connect, 3000);
        };
      } catch (err) {
        setError('Failed to connect to WebSocket');
        console.error('WebSocket connection error:', err);
      }
    };
    
    connect();
    
    return () => {
      if (websocket.current) {
        websocket.current.close();
      }
    };
  }, [url]);

  const sendMessage = (message: WebSocketMessage) => {
    if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
      websocket.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  };

  const subscribe = (messageType: string, handler: (data: any) => void) => {
    messageHandlers.current.set(messageType, handler);
    
    return () => {
      messageHandlers.current.delete(messageType);
    };
  };

  return {
    isConnected,
    lastMessage,
    error,
    sendMessage,
    subscribe
  };
}
