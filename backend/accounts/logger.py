import logging
import colorama
from colorama import Fore, Back, Style

# Initialize colorama for colored terminal output
colorama.init(autoreset=True)

class ColoredFormatter(logging.Formatter):
    """Custom formatter for colored log output"""
    
    COLORS = {
        'DEBUG': Fore.BLUE,
        'INFO': Fore.GREEN,
        'WARNING': Fore.YELLOW,
        'ERROR': Fore.RED,
        'CRITICAL': Fore.RED + Back.WHITE
    }

    def format(self, record):
        # Add colors to the log level name
        levelname = record.levelname
        if levelname in self.COLORS:
            record.levelname = f"{self.COLORS[levelname]}{levelname}{Style.RESET_ALL}"
            
        # Add colors to specific parts of the message
        if "SUCCESS" in str(record.msg):
            record.msg = f"{Fore.GREEN}{record.msg}{Style.RESET_ALL}"
        elif "FAILED" in str(record.msg):
            record.msg = f"{Fore.RED}{record.msg}{Style.RESET_ALL}"
            
        return super().format(record)

def setup_logger():
    """Set up the custom logger"""
    # Create logger
    logger = logging.getLogger('sms_logger')
    logger.setLevel(logging.DEBUG)
    
    # Create console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.DEBUG)
    
    # Create formatter
    formatter = ColoredFormatter(
        '%(asctime)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Add formatter to handler
    console_handler.setFormatter(formatter)
    
    # Add handler to logger
    logger.addHandler(console_handler)
    
    return logger

# Create the logger instance
sms_logger = setup_logger()