using System;
using System.Collections.Generic;
using System.Text;

namespace RentNest.Infrastructure.Exceptions
{
    public class NotFound : Exception
    {
        public int StatusCode = 404;

        public NotFound()
        {
        }

        public NotFound(string msg) : base(msg)
        {
            
        }
    }
}
