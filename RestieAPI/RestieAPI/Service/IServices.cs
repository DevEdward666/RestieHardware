using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RestieAPI.Services
{
    interface IServices
    {
        void InstallServices(IServiceCollection services, IConfiguration configuration);


    }
}
