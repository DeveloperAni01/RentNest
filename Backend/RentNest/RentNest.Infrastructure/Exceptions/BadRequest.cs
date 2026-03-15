using System;
using System.Collections.Generic;
using System.Text;

namespace RentNest.Infrastructure.Exceptions
{
    public class BadRequest  :Exception //extended base exception class
    {
        public int StatusCode = 400;
        public BadRequest(string msg) : base(msg)
        {
            
        }
    }
}
