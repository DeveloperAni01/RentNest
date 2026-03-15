using System;
using System.Collections.Generic;
using System.Text;

namespace RentNest.Infrastructure.Exceptions
{
    public class UnAuthorized  :Exception
    {
        public int StatusCode = 401;
        public UnAuthorized(string msg) :base(msg)
        {
            
        }
    }
}
