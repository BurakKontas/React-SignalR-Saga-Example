using Microsoft.AspNetCore.SignalR;

namespace WebApplication1;

public class ChatHub : Hub
{
    public async Task SendMessage(string method, string connectionId, object message)
    {
        await Clients.Client(connectionId).SendAsync(method, message);
        Console.WriteLine($"Sent message to {connectionId} using method {method}");
    }
}