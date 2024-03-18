using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Linq;

namespace RestieAPI.Services
{
    public static class ServiceExtentions
    {
        public static void InstallServicesInAssembly(this IServiceCollection services, IConfiguration configuration)
        {
            var combineServices = typeof(Startup).Assembly.ExportedTypes.Where(x =>
            typeof(IServices).IsAssignableFrom(x) && !x.IsInterface && !x.IsAbstract).Select(Activator.CreateInstance).Cast<IServices>().ToList();
            combineServices.ForEach(serv => serv.InstallServices(services, configuration));
        }
    }
}
