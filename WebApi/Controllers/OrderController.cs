using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace WebApplication1.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly ILogger<OrderController> _logger;
        private readonly IHubContext<ChatHub> _hubContext;

        public OrderController(ILogger<OrderController> logger, IHubContext<ChatHub> hubContext)
        {
            _logger = logger;
            _hubContext = hubContext;
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] Order order)
        {
            _logger.LogInformation("Order received: {OrderId}", order.OrderId);
            await ProcessOrderAsync(order);
            return Accepted();
        }

        private async Task ProcessOrderAsync(Order order)
        {

            await Task.Delay(3000);
            _logger.LogInformation("Order prepared: {OrderId}", order.OrderId);
            await SendSignalR(order,"Prepared");

            await Task.Delay(5000);
            _logger.LogInformation("Order on the way: {OrderId}", order.OrderId);
            await SendSignalR(order, "On the way");

            await Task.Delay(2000);
            _logger.LogInformation("Order delivered: {OrderId}", order.OrderId);
            await SendSignalR(order, "Delivered");
        }

        private async Task SendSignalR(Order order, string status)
        {
            await _hubContext.Clients.Client(order.ConnectionId).SendAsync($"OrderStatusUpdated-{order.RandomKey}", status);
        }
    }

    public class Order
    {
        public string OrderId { get; set; }
        public string ProductName { get; set; }
        public int Quantity { get; set; }
        public string ConnectionId { get; set; }
        public string RandomKey { get; set; }
    }
}
